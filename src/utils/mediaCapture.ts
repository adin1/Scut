// Real camera and microphone capture for the evidence vault.
// Media stays in memory (Blob) and never touches the phone's gallery or file system.

export function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach(track => track.stop());
}

export async function openCamera(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
    audio: false
  });
}

// Grabs the current frame at the camera's native resolution, not the preview size.
export function capturePhotoFrame(video: HTMLVideoElement): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx || !canvas.width || !canvas.height) {
    return Promise.reject(new Error('Camera nu a transmis încă imaginea.'));
  }
  ctx.drawImage(video, 0, 0);
  return new Promise((resolve, reject) =>
    canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('Fotografia nu a putut fi creată.'))), 'image/jpeg', 0.92)
  );
}

export class AudioCapture {
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];

  async start(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.chunks = [];
    this.recorder = new MediaRecorder(this.stream);
    this.recorder.ondataavailable = e => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };
    this.recorder.start(1000);
  }

  stop(): Promise<Blob> {
    const recorder = this.recorder;
    if (!recorder || recorder.state === 'inactive') {
      this.release();
      return Promise.reject(new Error('Nu există o înregistrare activă.'));
    }
    return new Promise(resolve => {
      recorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: recorder.mimeType || 'audio/webm' });
        this.release();
        resolve(blob);
      };
      recorder.stop();
    });
  }

  cancel() {
    if (this.recorder && this.recorder.state !== 'inactive') {
      this.recorder.onstop = null;
      this.recorder.stop();
    }
    this.release();
  }

  private release() {
    stopStream(this.stream);
    this.stream = null;
    this.recorder = null;
  }
}

export async function recordAudioFor(ms: number): Promise<Blob> {
  const capture = new AudioCapture();
  await capture.start();
  await new Promise(r => setTimeout(r, ms));
  return capture.stop();
}

export function extensionForMime(mime: string): string {
  if (mime.includes('jpeg')) return 'jpg';
  if (mime.includes('png')) return 'png';
  if (mime.includes('pdf')) return 'pdf';
  if (mime.includes('webm')) return 'webm';
  if (mime.includes('ogg')) return 'ogg';
  if (mime.includes('mp4')) return 'm4a';
  return 'bin';
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function describeMediaError(err: unknown, device: 'camera' | 'microfonul'): string {
  const name = err instanceof DOMException ? err.name : '';
  if (!navigator.mediaDevices?.getUserMedia) return `Acest browser nu permite accesul la ${device}.`;
  if (name === 'NotAllowedError' || name === 'SecurityError') return `Accesul la ${device} a fost refuzat. Permite-l din setările browserului.`;
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return `Nu a fost găsit${device === 'camera' ? 'ă nicio cameră' : ' niciun microfon'} pe acest dispozitiv.`;
  if (name === 'NotReadableError') return `${device === 'camera' ? 'Camera' : 'Microfonul'} este folosit${device === 'camera' ? 'ă' : ''} de altă aplicație.`;
  return err instanceof Error ? err.message : `Nu s-a putut porni ${device}.`;
}
