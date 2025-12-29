<script lang="ts">
  import { auth } from '$lib/firebase';
  
  // You might fetch counts here eventually
  let userEmail = $derived(auth.currentUser?.email || 'Admin');
</script>

<div class="space-y-6">
  <div class="md:flex md:items-center md:justify-between">
    <div class="min-w-0 flex-1">
      <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
        Dashboard
      </h2>
      <p class="mt-1 text-sm text-gray-500">
        Welcome back, {userEmail}! Manage your portfolio content from here.
      </p>
    </div>
  </div>

  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    <!-- Memories Card -->
    <a href="/admin/memories" class="group relative overflow-hidden rounded-lg bg-white p-6 shadow hover:shadow-md transition-all">
      <div class="absolute right-0 top-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-blue-50 transition-all group-hover:scale-110"></div>
      <div class="relative">
        <div class="flex items-center space-x-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">Memories</h3>
            <p class="mt-1 text-sm text-gray-500">Manage photo albums</p>
          </div>
        </div>
      </div>
    </a>

    <!-- Diary Card -->
    <a href="/admin/diary" class="group relative overflow-hidden rounded-lg bg-white p-6 shadow hover:shadow-md transition-all">
      <div class="absolute right-0 top-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-purple-50 transition-all group-hover:scale-110"></div>
      <div class="relative">
        <div class="flex items-center space-x-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">Diary</h3>
            <p class="mt-1 text-sm text-gray-500">Write daily journals</p>
          </div>
        </div>
      </div>
    </a>

    <!-- Blog Card -->
    <a href="/admin/blog" class="group relative overflow-hidden rounded-lg bg-white p-6 shadow hover:shadow-md transition-all">
      <div class="absolute right-0 top-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-green-50 transition-all group-hover:scale-110"></div>
      <div class="relative">
        <div class="flex items-center space-x-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600">
             <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">Blog</h3>
            <p class="mt-1 text-sm text-gray-500">Publish articles</p>
          </div>
        </div>
      </div>
    </a>
  </div>
</div>
