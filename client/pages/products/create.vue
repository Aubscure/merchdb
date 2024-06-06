<template>
<div class="flex justify-end">
  <nuxt-link 
          to="../products" 
          class="bg-[#0072BC] hover:bg-[#1B5D88] text-white p-2 mt-3 rounded-lg w-28 justify-center flex"
        >
          Go back
        </nuxt-link>
</div>
  <div class="my-10 scrollbar-hide">
    <div class="flex items-center justify-center max-w-lg p-6 mx-auto space-x-4 bg-gray-800 shadow-md ring-1 shadow-gray-700 ring-gray-700 rounded-xl">
      <div>
        <form @submit.prevent="handleSubmit" class="flex flex-col justify-center">
          <label class="self-center pb-6 text-lg font-medium text-gray-100">Add Product</label>
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
            class="relative flex items-center justify-center p-6 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer h-52 min-w-96 input hover:border-gray-200"
          >
            <span v-if="!state.data.photo" class="text-gray-400">Drag and drop a photo here, or click to select</span>
            <input type="file" @change="handleFileChange" class="hidden" ref="fileInput" />
            <img v-if="state.data.photo" :src="photoURL" alt="Photo Preview" class="absolute inset-0 object-cover w-full h-full rounded-lg" />
          </div>
          <p class="self-center mb-5 text-white">Image size up to 2MB only</p>
          
          <button 
            type="submit" 
            class="btn bg-[#0072BC] hover:bg-[#1B5D88] text-white p-2 rounded-lg"
            :disabled="state.loading"
          >
            <span v-if="state.loading">Submitting...</span>
            <span v-else>Submit Product</span>
          </button>
          <div v-if="state.errors" class="mt-4 text-red-500">{{ state.errors }}</div>
        </form>

      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, reactive, computed } from 'vue';

const fileInput = ref(null);

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
      return;
    }

    alert("Product successfully created!");
    console.log('Product created:', await response.json());

    // Reset form data
    state.data.name = null;
    state.data.description = null;
    state.data.quantity = null;
    state.data.price = null;
    state.data.photo = null;
  } catch (error) {
    state.errors = "Error creating product: " + error.message;
  } finally {
    state.loading = false;
  }
}
</script>
