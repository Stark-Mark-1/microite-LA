<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useAppStore } from '@/store/appstore'

const appStore = useAppStore()

// Ref for the scrollable container
const scrollContainer = ref<HTMLElement | null>(null)

// Size options for dropdowns
const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

// Hospital options for dropdown
const hospitalOptions = [
  'Cedars-Sinai Medical Center (Beverly Hills)',
  'Huntington Health | Pasadena',
  'Cedar-Sinai Marina del Rey',
  'Torrance Memorial Medical Center',
  'Providence Cedars-Sinai Tarzana Medical Center'
]

// Form data
const formData = ref({
  firstName: '',
  lastName: '',
  hospital: '',
  email: '',
  shirtSize: '',
  jacketSize: '',
})

// Validation errors
const errors = ref<Record<string, string>>({})

// Modal state
const openModal = ref<string | null>(null)

// Toggle modal
const toggleModal = (fieldName: string) => {
  if (openModal.value === fieldName) {
    openModal.value = null
  } else {
    openModal.value = fieldName
  }
}

// Close modal
const closeModal = () => {
  openModal.value = null
}

// Select option
const selectOption = (fieldName: 'shirtSize' | 'jacketSize' | 'hospital', value: string) => {
  formData.value[fieldName] = value
  openModal.value = null
  handleInput(fieldName)
}

// Close modal when clicking on backdrop
const handleBackdropClick = (event: MouseEvent | TouchEvent) => {
  const target = event.target as HTMLElement
  // Check if click is on the backdrop itself (not on modal content)
  if (target === event.currentTarget || target.classList.contains('modal-backdrop')) {
    event.preventDefault()
    event.stopPropagation()
    closeModal()
  }
}

// Close modal on escape key
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeModal()
  }
}

// Viewport resize handler for mobile keyboard
let viewportResizeHandler: (() => void) | null = null

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
  
  // Handle viewport changes on mobile (keyboard appearing/disappearing)
  if (window.visualViewport) {
    // Inside onMounted -> viewportResizeHandler

viewportResizeHandler = () => {
  const activeElement = document.activeElement as HTMLInputElement
  if (activeElement && activeElement.tagName === 'INPUT' && scrollContainer.value) {
    requestAnimationFrame(() => {
      const inputRect = activeElement.getBoundingClientRect()
      const viewportHeight = window.visualViewport!.height
      
      const isEmailField = activeElement.type === 'email'

      // CHANGE 1: Increase this to 350. 
      // This accounts for the extra height of the "Glass UI" suggestion bar.
      const bottomThreshold = isEmailField ? 350 : 80
      
      // CHANGE 2: Decrease this to 20.
      // This pulls the field up to the very top of the visible area.
      const extraPadding = isEmailField ? 20 : 150
      
      if (inputRect.bottom > viewportHeight - bottomThreshold) {
        // ... (rest of the code remains the same)
        const inputOffsetTop = activeElement.offsetTop
        scrollContainer.value!.scrollTo({
          top: inputOffsetTop - extraPadding,
          behavior: 'smooth' // You can try 'auto' if smooth is too slow
        })
      }
    })
  }
}
    
    window.visualViewport.addEventListener('resize', viewportResizeHandler)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  if (window.visualViewport && viewportResizeHandler) {
    window.visualViewport.removeEventListener('resize', viewportResizeHandler)
  }
})

// Validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validateCedarsEmail = (email: string): boolean => {
  return email.toLowerCase().endsWith('@cedars.com')
}

const validateField = (fieldName: string, value: string): string => {
  if (!value || value.trim() === '') {
    return `${fieldName} is required`
  }
  
  switch (fieldName) {
    case 'EMPLOYEE WORK EMAIL':
      if (!validateEmail(value)) {
        return 'Please enter a valid email address'
      }
      if (!validateCedarsEmail(value)) {
        return 'Only cedars.com emails are eligible'
      }
      break
    case 'FIRST NAME':
    case 'LAST NAME':
      if (value.trim().length < 2) {
        return `${fieldName} must be at least 2 characters`
      }
      if (!/^[a-zA-Z\s'-]+$/.test(value)) {
        return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`
      }
      break
    case 'HOSPITAL':
      // Validate against available hospital options
      if (!hospitalOptions.includes(value.trim())) {
        return 'Please select a valid hospital'
      }
      break
    case 'SHIRT SIZE':
    case 'JACKET SIZE':
      // Validate against available size options
      if (!sizeOptions.includes(value.trim().toUpperCase())) {
        return 'Please select a valid size'
      }
      break
  }
  
  return ''
}

const validateForm = (): boolean => {
  errors.value = {}
  
  const fields = [
    { key: 'firstName', label: 'FIRST NAME' },
    { key: 'lastName', label: 'LAST NAME' },
    { key: 'hospital', label: 'HOSPITAL' },
    { key: 'email', label: 'EMPLOYEE WORK EMAIL' },
    { key: 'shirtSize', label: 'SHIRT SIZE' },
    { key: 'jacketSize', label: 'JACKET SIZE' },
  ]
  
  let isValid = true
  
  fields.forEach(({ key, label }) => {
    const error = validateField(label, formData.value[key as keyof typeof formData.value])
    if (error) {
      errors.value[key] = error
      isValid = false
    }
  })
  
  return isValid
}

const handleSubmit = () => {
  if (validateForm()) {
    // Form is valid, proceed with submission
    console.log('Form submitted:', formData.value)

    // Show final screen
    appStore.showdata = false
    appStore.showfinal = true
    appStore.sendAnalyticsData('submitbtn')
    appStore.sendFormData(formData.value.firstName, formData.value.lastName, formData.value.email, formData.value.hospital, formData.value.shirtSize, formData.value.jacketSize)
  }
}

const handleInput = (fieldName: string) => {
  // Clear error when user starts typing
  if (errors.value[fieldName]) {
    delete errors.value[fieldName]
  }
}

// Handle input focus to scroll into view on mobile
const handleInputFocus = (event: Event) => {
  const input = event.target as HTMLInputElement
  
  // IMPORTANT: Only handle INPUT elements, not buttons
  if (!scrollContainer.value || input.tagName !== 'INPUT') return
  
  // Check if this is the email field (needs extra space for autocomplete bar)
  const isEmailField = input.type === 'email' || input.getAttribute('type') === 'email'
  
  const scrollOffset = isEmailField ? 50 : 150 // Pixels from top - smaller = more space above, larger = less space above
  
  // Use requestAnimationFrame and setTimeout to ensure keyboard is shown before scrolling
  requestAnimationFrame(() => {
    setTimeout(() => {
      // Always scroll when any input field is focused to move fields below down
      const inputOffsetTop = input.offsetTop
      
      scrollContainer.value!.scrollTo({
        top: inputOffsetTop - scrollOffset,
        behavior: 'smooth'
      })
    }, 400) // Delay to account for keyboard animation on iOS
  })
}
</script>

<template>
  <!-- Full-screen content overlay that sits on top of the existing background -->
  <div class="fixed inset-0 flex flex-col text-white pointer-events-none overflow-hidden" style="touch-action: none; overscroll-behavior: none;">
    <!-- Center content with form -->
    <div 
      ref="scrollContainer"
      class="flex-1 flex items-start justify-center px-8 py-8 pointer-events-auto overflow-y-auto"
      style="overflow-y: auto; -webkit-overflow-scrolling: touch; padding-top: max(2rem, env(safe-area-inset-top)); padding-bottom: max(2rem, env(safe-area-inset-bottom));"
    >
      <div class="w-full max-w-md py-8">
        <!-- Title -->
        <h1 class="font-serif font-light text-[38px] leading-[42px] mb-8">
          ENTER<br />
          YOUR DETAILS
        </h1>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- First Name -->
          <div>
            <input
              v-model="formData.firstName"
              @input="handleInput('firstName')"
              @focus="handleInputFocus"
              type="text"
              autocomplete="new-password"
              autocorrect="off"
              autocapitalize="off"
              spellcheck="false"
              placeholder="FIRST NAME*"
              class="w-full px-4 py-3 rounded-full bg-white text-gray-900 placeholder-gray-500 text-base font-medium focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              :class="{ 'ring-2 ring-red-400': errors.firstName }"
            />
            <p v-if="errors.firstName" class="mt-1 ml-4 text-xs text-red-300">
              {{ errors.firstName }}
            </p>
          </div>

          <!-- Last Name -->
          <div>
            <input
              v-model="formData.lastName"
              @input="handleInput('lastName')"
              @focus="handleInputFocus"
              type="text"
              autocomplete="new-password"
              autocorrect="off"
              autocapitalize="off"
              spellcheck="false"
              placeholder="LAST NAME*"
              class="w-full px-4 py-3 rounded-full bg-white text-gray-900 placeholder-gray-500 text-base font-medium focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              :class="{ 'ring-2 ring-red-400': errors.lastName }"
            />
            <p v-if="errors.lastName" class="mt-1 ml-4 text-xs text-red-300">
              {{ errors.lastName }}
            </p>
          </div>

          <!-- Hospital -->
          <div class="relative">
            <button
              type="button"
              @click="toggleModal('hospital')"
              class="w-full px-4 py-3 pr-10 rounded-full bg-white text-gray-900 text-base font-medium focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-left flex items-center justify-between"
              :class="{ 'ring-2 ring-red-400': errors.hospital }"
            >
              <span :class="{ 'text-gray-500': !formData.hospital }" class="truncate">
                {{ formData.hospital || 'HOSPITAL*' }}
              </span>
              <svg 
                class="w-5 h-5 text-red-500 transition-transform duration-200 flex-shrink-0 ml-2"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            <p v-if="errors.hospital" class="mt-1 ml-4 text-xs text-red-300">
              {{ errors.hospital }}
            </p>
          </div>

          <!-- Employee Work Email -->
          <div>
            <input
              v-model="formData.email"
              @input="handleInput('email')"
              @focus="handleInputFocus"
              type="email"
              autocomplete="new-password"
              autocorrect="off"
              autocapitalize="off"
              spellcheck="false"
              name="email-address"
              placeholder="EMPLOYEE WORK EMAIL*"
              class="w-full px-4 py-3 rounded-full bg-white text-gray-900 placeholder-gray-500 text-base font-medium focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              :class="{ 'ring-2 ring-red-400': errors.email }"
            />
            <p v-if="errors.email" class="mt-1 ml-4 text-xs text-red-300">
              {{ errors.email }}
            </p>
          </div>

          <!-- Shirt Size -->
          <div class="relative">
            <button
              type="button"
              @click="toggleModal('shirtSize')"
              class="w-full px-4 py-3 pr-10 rounded-full bg-white text-gray-900 text-base font-medium focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-left flex items-center justify-between"
              :class="{ 'ring-2 ring-red-400': errors.shirtSize }"
            >
              <span :class="{ 'text-gray-500': !formData.shirtSize }">
                {{ formData.shirtSize || 'SHIRT SIZE*' }}
              </span>
              <svg 
                class="w-5 h-5 text-red-500 transition-transform duration-200 flex-shrink-0 ml-2"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            <p v-if="errors.shirtSize" class="mt-1 ml-4 text-xs text-red-300">
              {{ errors.shirtSize }}
            </p>
          </div>

          <!-- Jacket Size -->
          <div class="relative">
            <button
              type="button"
              @click="toggleModal('jacketSize')"
              class="w-full px-4 py-3 pr-10 rounded-full bg-white text-gray-900 text-base font-medium focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-left flex items-center justify-between"
              :class="{ 'ring-2 ring-red-400': errors.jacketSize }"
            >
              <span :class="{ 'text-gray-500': !formData.jacketSize }">
                {{ formData.jacketSize || 'JACKET SIZE*' }}
              </span>
              <svg 
                class="w-5 h-5 text-red-500 transition-transform duration-200 flex-shrink-0 ml-2"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            <p v-if="errors.jacketSize" class="mt-1 ml-4 text-xs text-red-300">
              {{ errors.jacketSize }}
            </p>
          </div>

          <!-- Required indicator -->
          <p class="text-xs text-white/80 ml-4 mt-2">*Required</p>

          <!-- Submit Button -->
          <button
            type="submit"
            class="mt-1 mb-8 inline-flex items-center justify-center rounded-full bg-white text-[13px] tracking-wide text-gray-900 px-10 py-2 shadow-md font-sans"
          >
            SUBMIT
          </button>
        </form>
      </div>
    </div>

  </div>

  <!-- Shirt Size Modal -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="openModal === 'shirtSize'"
        class="fixed inset-0 z-[9999] flex items-center justify-center modal-backdrop pointer-events-auto"
        @click="handleBackdropClick"
        @touchend="handleBackdropClick"
        style="background-color: rgba(0, 0, 0, 0.5);"
      >
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div
            v-if="openModal === 'shirtSize'"
            class="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden w-full max-w-xs mx-4 pointer-events-auto"
            @click.stop
            @touchend.stop
          >
            <div class="px-4 py-2.5 border-b border-red-100">
              <h2 class="text-sm font-medium text-gray-900">SELECT SHIRT SIZE</h2>
            </div>
            <div class="py-1 pointer-events-auto">
              <button
                v-for="(size, index) in sizeOptions"
                :key="size"
                type="button"
                @click="selectOption('shirtSize', size)"
                class="w-full px-4 py-2.5 text-left text-gray-900 text-sm font-medium hover:bg-red-50 active:bg-red-100 transition-colors pointer-events-auto touch-manipulation border-b border-red-100 last:border-b-0"
                :class="{ 'bg-red-100 text-red-600': formData.shirtSize === size }"
              >
                {{ size }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>

  <!-- Jacket Size Modal -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="openModal === 'jacketSize'"
        class="fixed inset-0 z-[9999] flex items-center justify-center modal-backdrop pointer-events-auto"
        @click="handleBackdropClick"
        @touchend="handleBackdropClick"
        style="background-color: rgba(0, 0, 0, 0.5);"
      >
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div
            v-if="openModal === 'jacketSize'"
            class="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden w-full max-w-xs mx-4 pointer-events-auto"
            @click.stop
            @touchend.stop
          >
            <div class="px-4 py-2.5 border-b border-red-100">
              <h2 class="text-sm font-medium text-gray-900">SELECT JACKET SIZE</h2>
            </div>
            <div class="py-1 pointer-events-auto">
              <button
                v-for="(size, index) in sizeOptions"
                :key="size"
                type="button"
                @click="selectOption('jacketSize', size)"
                class="w-full px-4 py-2.5 text-left text-gray-900 text-sm font-medium hover:bg-red-50 active:bg-red-100 transition-colors pointer-events-auto touch-manipulation border-b border-red-100 last:border-b-0"
                :class="{ 'bg-red-100 text-red-600': formData.jacketSize === size }"
              >
                {{ size }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>

  <!-- Hospital Modal -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="openModal === 'hospital'"
        class="fixed inset-0 z-[9999] flex items-center justify-center modal-backdrop pointer-events-auto"
        @click="handleBackdropClick"
        @touchend="handleBackdropClick"
        style="background-color: rgba(0, 0, 0, 0.5);"
      >
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div
            v-if="openModal === 'hospital'"
            class="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden w-full max-w-md mx-4 pointer-events-auto max-h-[80vh] flex flex-col"
            @click.stop
            @touchend.stop
          >
            <div class="px-4 py-2.5 border-b border-red-100 flex-shrink-0">
              <h2 class="text-sm font-medium text-gray-900">SELECT HOSPITAL</h2>
            </div>
            <div class="py-1 pointer-events-auto overflow-y-auto modal-scrollbar flex-1">
              <button
                v-for="(hospital, index) in hospitalOptions"
                :key="hospital"
                type="button"
                @click="selectOption('hospital', hospital)"
                class="w-full px-4 py-2.5 text-left text-gray-900 text-sm font-medium hover:bg-red-50 active:bg-red-100 transition-colors pointer-events-auto touch-manipulation border-b border-red-100 last:border-b-0"
                :class="{ 'bg-red-100 text-red-600': formData.hospital === hospital }"
              >
                {{ hospital }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Custom red scrollbar for modals */
.modal-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #ef4444 #ffffff;
}

.modal-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.modal-scrollbar::-webkit-scrollbar-track {
  background: #ffffff;
  border-radius: 4px;
}

.modal-scrollbar::-webkit-scrollbar-thumb {
  background: #ef4444;
  border-radius: 4px;
}

.modal-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #dc2626;
}

/* Firefox scrollbar */
.modal-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #ef4444 #ffffff;
}

/* Mobile-specific styles for better keyboard handling */
@media (max-width: 768px) {
  /* Ensure inputs are easily tappable */
  input {
    font-size: 16px !important; /* Prevents zoom on iOS */
  }
  
  /* Better spacing on mobile */
  .flex-1 {
    align-items: flex-start !important;
    padding-top: 1.5rem !important;
  }
  
  /* Extra spacing for email field to account for autocomplete bar */
  input[type="email"]:focus {
    margin-bottom: 0.5rem;
  }
  
  /* Prevent iOS from showing autocomplete suggestions */
  input[type="email"] {
    -webkit-appearance: none;
    appearance: none;
  }
}

/* Support for iOS safe areas */
@supports (padding: max(0px)) {
  .flex-1 {
    padding-top: max(1.5rem, env(safe-area-inset-top)) !important;
    padding-bottom: max(1.5rem, env(safe-area-inset-bottom)) !important;
  }
}
</style>
