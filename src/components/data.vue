<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/store/appstore'

const appStore = useAppStore()

// Size options for dropdowns
const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

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

// Dropdown state
const openDropdown = ref<string | null>(null)

// Toggle dropdown
const toggleDropdown = (fieldName: string) => {
  if (openDropdown.value === fieldName) {
    openDropdown.value = null
  } else {
    openDropdown.value = fieldName
  }
}

// Select option
const selectOption = (fieldName: 'shirtSize' | 'jacketSize', value: string) => {
  formData.value[fieldName] = value
  openDropdown.value = null
  handleInput(fieldName)
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.custom-dropdown')) {
    openDropdown.value = null
  }
}

// Close dropdown on escape key
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    openDropdown.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
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
      if (value.trim().length < 2) {
        return 'Hospital name must be at least 2 characters'
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
</script>

<template>
  <!-- Full-screen content overlay that sits on top of the existing background -->
  <div class="fixed inset-0 flex flex-col text-white pointer-events-none overflow-hidden" style="touch-action: none; overscroll-behavior: none;">
    <!-- Center content with form -->
    <div class="flex-1 flex items-center justify-center px-8 py-12 pointer-events-auto" style="overflow: hidden;">
      <div class="w-full max-w-md">
        <!-- Title -->
        <h1 class="text-4xl md:text-5xl font-serif font-bold leading-tight mb-8">
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
              type="text"
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
              type="text"
              placeholder="LAST NAME*"
              class="w-full px-4 py-3 rounded-full bg-white text-gray-900 placeholder-gray-500 text-base font-medium focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              :class="{ 'ring-2 ring-red-400': errors.lastName }"
            />
            <p v-if="errors.lastName" class="mt-1 ml-4 text-xs text-red-300">
              {{ errors.lastName }}
            </p>
          </div>

          <!-- Hospital -->
          <div>
            <input
              v-model="formData.hospital"
              @input="handleInput('hospital')"
              type="text"
              placeholder="HOSPITAL*"
              class="w-full px-4 py-3 rounded-full bg-white text-gray-900 placeholder-gray-500 text-base font-medium focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              :class="{ 'ring-2 ring-red-400': errors.hospital }"
            />
            <p v-if="errors.hospital" class="mt-1 ml-4 text-xs text-red-300">
              {{ errors.hospital }}
            </p>
          </div>

          <!-- Employee Work Email -->
          <div>
            <input
              v-model="formData.email"
              @input="handleInput('email')"
              type="email"
              placeholder="EMPLOYEE WORK EMAIL*"
              class="w-full px-4 py-3 rounded-full bg-white text-gray-900 placeholder-gray-500 text-base font-medium focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              :class="{ 'ring-2 ring-red-400': errors.email }"
            />
            <p v-if="errors.email" class="mt-1 ml-4 text-xs text-red-300">
              {{ errors.email }}
            </p>
          </div>

          <!-- Shirt Size -->
          <div class="relative custom-dropdown">
            <button
              type="button"
              @click="toggleDropdown('shirtSize')"
              class="w-full px-4 py-3 pr-10 rounded-full bg-white text-gray-900 text-base font-medium focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-left flex items-center justify-between"
              :class="{ 'ring-2 ring-red-400': errors.shirtSize, 'ring-2 ring-red-500': openDropdown === 'shirtSize' }"
            >
              <span :class="{ 'text-gray-500': !formData.shirtSize }">
                {{ formData.shirtSize || 'SHIRT SIZE*' }}
              </span>
              <svg 
                class="w-5 h-5 text-red-500 transition-transform duration-200 flex-shrink-0 ml-2"
                :class="{ 'rotate-180': openDropdown === 'shirtSize' }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            <!-- Dropdown Options -->
            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 -translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2"
            >
              <div
                v-if="openDropdown === 'shirtSize'"
                class="absolute z-50 w-full top-full mt-2 rounded-2xl bg-white shadow-lg border border-red-100 overflow-hidden"
                style="max-height: calc(100vh - 20px);"
              >
                <div class="py-1 overflow-y-auto dropdown-scrollbar" style="max-height: 180px; touch-action: pan-y; -webkit-overflow-scrolling: touch;">
                  <button
                    v-for="size in sizeOptions"
                    :key="size"
                    type="button"
                    @click="selectOption('shirtSize', size)"
                    class="w-full px-4 py-3 text-left text-gray-900 text-base font-medium hover:bg-red-50 transition-colors"
                    :class="{ 'bg-red-100 text-red-600': formData.shirtSize === size }"
                  >
                    {{ size }}
                  </button>
                </div>
              </div>
            </Transition>
            <p v-if="errors.shirtSize" class="mt-1 ml-4 text-xs text-red-300">
              {{ errors.shirtSize }}
            </p>
          </div>

          <!-- Jacket Size -->
          <div class="relative custom-dropdown">
            <button
              type="button"
              @click="toggleDropdown('jacketSize')"
              class="w-full px-4 py-3 pr-10 rounded-full bg-white text-gray-900 text-base font-medium focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-left flex items-center justify-between"
              :class="{ 'ring-2 ring-red-400': errors.jacketSize, 'ring-2 ring-red-500': openDropdown === 'jacketSize' }"
            >
              <span :class="{ 'text-gray-500': !formData.jacketSize }">
                {{ formData.jacketSize || 'JACKET SIZE*' }}
              </span>
              <svg 
                class="w-5 h-5 text-red-500 transition-transform duration-200 flex-shrink-0 ml-2"
                :class="{ 'rotate-180': openDropdown === 'jacketSize' }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            <!-- Dropdown Options -->
            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 -translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2"
            >
              <div
                v-if="openDropdown === 'jacketSize'"
                class="absolute z-50 w-full top-full mt-2 rounded-2xl bg-white shadow-lg border border-red-100 overflow-hidden"
                style="max-height: calc(100vh - 20px);"
              >
                <div class="py-1 overflow-y-auto dropdown-scrollbar" style="max-height: 180px; touch-action: pan-y; -webkit-overflow-scrolling: touch;">
                  <button
                    v-for="size in sizeOptions"
                    :key="size"
                    type="button"
                    @click="selectOption('jacketSize', size)"
                    class="w-full px-4 py-3 text-left text-gray-900 text-base font-medium hover:bg-red-50 transition-colors"
                    :class="{ 'bg-red-100 text-red-600': formData.jacketSize === size }"
                  >
                    {{ size }}
                  </button>
                </div>
              </div>
            </Transition>
            <p v-if="errors.jacketSize" class="mt-1 ml-4 text-xs text-red-300">
              {{ errors.jacketSize }}
            </p>
          </div>

          <!-- Required indicator -->
          <p class="text-xs text-white/80 ml-4 mt-2">*Required</p>

          <!-- Submit Button -->
          <button
            type="submit"
            class="mt-6 w-full px-8 py-3 rounded-full bg-white text-gray-900 text-sm font-semibold tracking-wide shadow-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            SUBMIT
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom red scrollbar for dropdowns */
.dropdown-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #ef4444 #ffffff;
}

.dropdown-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.dropdown-scrollbar::-webkit-scrollbar-track {
  background: #ffffff;
  border-radius: 4px;
}

.dropdown-scrollbar::-webkit-scrollbar-thumb {
  background: #ef4444;
  border-radius: 4px;
}

.dropdown-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #dc2626;
}

/* Firefox scrollbar */
.dropdown-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #ef4444 #ffffff;
}
</style>
