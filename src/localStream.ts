export async function getLocalStream() {
  return await navigator.mediaDevices.getUserMedia({
    video: true
  });
}
