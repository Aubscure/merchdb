<template>
  <div>
    <div class="flex items-center justify-between mb-10">
      <h1 class="text-3xl font-bold text-gray-200">Create Product</h1>
      <nuxt-link to="../products" class="px-4 py-2 font-bold text-white transition-colors duration-300 ease-in-out bg-indigo-600 rounded hover:bg-indigo-500">Go back</nuxt-link>
    </div>
    <!-- <nuxt-link to="../products" class="flex justify-center p-2 mt-3 text-white bg-indigo-600 rounded hover:bg-indigo-500 w-28">Go back</nuxt-link> -->

    <Notification :show="show" :success="success" :errorMessage="state.errors" successMessage="Product successfully saved!" />
    
    <div class="my-10 scrollbar-hide">
      <div class="flex items-center justify-center max-w-lg p-6 mx-auto space-x-4 bg-gray-800 shadow-md ring-1 shadow-gray-700 ring-gray-700 rounded-xl">
        <div>
          <form @submit.prevent="handleSubmit" class="flex flex-col justify-center">
            <!-- <label class="self-center pb-6 text-lg font-medium text-gray-100">Add Product</label> -->
            <input 
              type="text" 
              placeholder="Name" 
              class="p-2 mb-4 border-2 border-gray-200 rounded-lg textb input hover:border-gray-700" 
              v-model="state.data.name" 
            />
            <textarea 
              placeholder="Description" 
              class="p-2 mb-4 border-2 border-gray-200 rounded-lg input hover:border-gray-700" 
              v-model="state.data.description">
            </textarea>
            <input 
              type="number" 
              placeholder="Quantity" 
              class="p-2 mb-4 border-2 border-gray-200 rounded-lg input hover:border-gray-700" 
              v-model="state.data.quantity" 
            />
            <input 
              type="number" 
              placeholder="Price" 
              class="p-2 mb-4 border-2 border-gray-200 rounded-lg input hover:border-gray-700" 
              v-model="state.data.price" 
            />

            <!-- Modern drag-and-drop file input -->
            <div 
              @dragover.prevent 
              @dragenter.prevent 
              @drop.prevent="handleFileDrop" 
              @click="triggerFileInput"
              class="relative flex items-center justify-center object-contain p-6 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer h-52 min-w-96 input hover:border-gray-200"
            >
              <span v-if="!state.data.photo" class="text-gray-400">Drag and drop a photo here, or click to select</span>
              <input type="file" @change="handleFileChange" class="hidden" ref="fileInput" />
              <img v-if="state.data.photo" :src="photoURL" alt="Photo Preview" class="absolute inset-0 object-contain w-full h-full rounded-lg" />
            </div>
            <p class="self-center mb-5 text-white">Image size up to 2MB only</p>
            
            <button 
              type="submit" 
              class="p-2 text-white bg-indigo-600 rounded-lg btn hover:bg-indigo-600"
              :disabled="state.loading"
            >
              <span v-if="state.loading">Submitting...</span>
              <span v-else>Submit Product</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>

  
</template>


<script setup>
import { ref, reactive, computed } from 'vue';
import Notification from '~/components/form/Notification.vue';

const fileInput = ref(null);
const show = ref(false);
const success = ref(false);

const state = reactive({
  errors: null,
  loading: false,
  data: {
    name: null,
    description: null,
    quantity: null,
    price: null,
    photo: null,
  }
});

const photoURL = computed(() => {
  return state.data.photo ? URL.createObjectURL(state.data.photo) : null;
});

function handleFileChange(event) {
  const file = event.target.files[0];
  state.data.photo = file;
}

function handleFileDrop(event) {
  const file = event.dataTransfer.files[0];
  state.data.photo = file;
}

function triggerFileInput() {
  fileInput.value.click();
}

async function handleSubmit() {
  state.loading = true;
  state.errors = null;

  if (!state.data.name || !state.data.description || !state.data.quantity || !state.data.price || !state.data.photo) {
    state.errors = "All fields are required.";
    state.loading = false;
    show.value = true;
    setTimeout(() => show.value = false, 1500);
    return;
  }

  try {
    const formData = new FormData();
    formData.append('name', state.data.name);
    formData.append('description', state.data.description);
    formData.append('quantity', state.data.quantity);
    formData.append('price', state.data.price);
    formData.append('photo', state.data.photo);

    const response = await fetch('http://127.0.0.1:8000/api/products', {
      method: 'POST',
      headers: {
        Authorization: "Bearer " + localStorage.getItem('_token'),
      },
      body: formData,
    });

    if (!response.ok) {
      state.errors = "Error submitting form. Please try again.";
      state.loading = false;
      show.value = true;
      setTimeout(() => show.value = false, 1500);
      return;
    }

    console.log('Product created:', await response.json());
    success.value = true; 
    show.value = true; 
    setTimeout(() => show.value = false, 1500);
    resetForm()
  } catch (error) {
    state.errors = "Error creating product: " + error.message;
    success.value = false; 
    show.value = true; 
    setTimeout(() => show.value = false, 1500);
  } finally {
    state.loading = false;
  }
}

const resetForm = () => {
  state.data.value = { name: '', description: '', photo: '', quantity: '', price: '' };
};
</script>
