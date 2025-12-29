<script lang="ts">
  import { storage } from '$lib/firebase';
  import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
  import imageCompression from 'browser-image-compression';

  let { onUploadComplete, multiple = false, folder = 'uploads' } = $props();

  let uploading = $state(false);
  let progress = $state(0);
  let error = $state('');

  async function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (!files || files.length === 0) return;

    uploading = true;
    error = '';
    progress = 0;

    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Compress image
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true
        };
        
        let fileToUpload = file;
        try {
            fileToUpload = await imageCompression(file, options);
        } catch (compressionError) {
            console.warn("Image compression failed, uploading original:", compressionError);
        }

        // Create storage reference
        const timestamp = Date.now();
        const uniqueName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const storageRef = ref(storage, `${folder}/${uniqueName}`);

        // Upload
        const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              // Calculate aggregate progress for multiple files roughly
              const singleFileProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              const overallProgress = ((i * 100) + singleFileProgress) / files.length;
              progress = Math.round(overallProgress);
            },
            (err) => {
              reject(err);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              uploadedUrls.push(downloadURL);
              resolve();
            }
          );
        });
      }

      onUploadComplete(uploadedUrls);
      
    } catch (err: any) {
      console.error('Upload failed:', err);
      error = 'Upload failed: ' + err.message;
    } finally {
      uploading = false;
      target.value = ''; // Reset input
    }
  }
</script>

<div class="w-full">
  <!-- Hidden file input -->
  <input
    type="file"
    id="file-upload"
    class="hidden"
    accept="image/*"
    {multiple}
    onchange={handleFileSelect}
    disabled={uploading}
  />

  <label
    for="file-upload"
    class="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 p-6 text-center transition-colors {uploading ? 'cursor-not-allowed opacity-50' : ''}"
  >
    {#if uploading}
      <div class="flex flex-col items-center">
         <svg class="h-8 w-8 animate-spin text-gray-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        <p class="text-sm text-gray-500">Uploading... {progress}%</p>
      </div>
    {:else}
      <svg
        class="mb-2 h-8 w-8 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        ></path>
      </svg>
      <span class="text-sm font-medium text-gray-600">
        Click to upload (max 1920px width)
      </span>
      <span class="mt-1 text-xs text-gray-500">
        Multiple files allowed
      </span>
    {/if}
  </label>

  {#if error}
    <p class="mt-2 text-sm text-red-600">{error}</p>
  {/if}
</div>
