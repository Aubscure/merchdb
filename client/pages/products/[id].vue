<template>
  <div class="lg:grid lg:grid-cols-2 lg:space-x-10">
    <div id="preview box" class="p-6 bg-gray-800 rounded-lg ring-1 ring-gray-700">
      <div v-if="state.products">
        <div class="flex justify-center">
          <img :src="previewProductData.photo || URL.createObjectURL(state.data.photo)" alt="Product Photo" class="w-6/7 h-5/6" />
        </div>
        <div class="my-3 text-4xl text-gray-100">{{ previewProductData.name || state.data.name }}</div>
        <div class="my-3 text-lg text-gray-400">{{ previewProductData.description || state.data.description }}</div>
        <div class="my-3 text-xl text-gray-100">Quantity: {{ previewProductData.quantity || state.data.quantity }}</div>
        <div class="my-3 text-xl text-gray-100">Price: {{ previewProductData.price || state.data.price }}</div>
      </div>
      <div v-else>
        <p>Loading product details...</p>
      </div>
    </div>
    <div id="input box" class="grid justify-center grid-cols-1 px-6 bg-gray-800 rounded-lg ring-1 ring-gray-700">
      <div v-if="state.products" class="flex flex-col space-y-4">
        <label class="self-center my-4 text-lg font-medium text-gray-100">Update Product</label>
        <input v-model="state.data.name" @input="updatePreview" type="text" name="product name" class="h-10 px-3 py-2 rounded-lg" :placeholder="state.data.name">
        <textarea v-model="state.data.description" @input="updatePreview" name="description" cols="30" rows="10" class="px-3 py-2 rounded-lg h-28" :placeholder="state.data.description"></textarea>
        <div class="flex justify-center space-x-4">
          <input v-model.number="state.data.quantity" @input="updatePreview" type="number" :placeholder="state.data.quantity" class="p-2 border-2 rounded-lg input hover:border-gray-700" />
          <input v-model.number="state.data.price" @input="updatePreview" type="number" :placeholder="state.data.price" class="p-2 border-2 rounded-lg input hover:border-gray-700" />
          <input ref="fileInput" type="file" @change="handleFileChange" class="p-2 mb-4 border-2 border-gray-200 rounded-lg input hover:border-gray-700" />
        </div>
        <div>
          <button @click="cancelUpdate" class="btn w-full mb-4 ring-1 hover:bg-[#1B5D88] text-white p-2 rounded-lg">Cancel</button>
          <button @click="uploadData" class="w-full px-2 py-2 mb-8 text-gray-100 transition-colors duration-300 ease-in-out bg-[#0072BC] rounded hover:bg-[#1B5D88] hover:text-gray-100">Update</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const state = reactive({
  id: null,
  products: null,
  errors: null,
  data: {
    name: null,
    description: null,
    quantity: null,
    price: null,
    photo: null,
  }
})

const fileInput = ref(null)

function handleFileChange(event) {
  const file = event.target.files[0]
  state.data.photo = file
  updatePreview()
}

async function fetchProductDetails(id) {
  const params = {
    Authorization: "Bearer " + localStorage.getItem('_token'),
    Accept: "application/json"
  }

  try {
    const response = await fetch(`http://127.0.0.1:8000/api/products/${id}`, {
      headers: params
    }).then(res => res.json())

    state.data = response.data
    previewProductData.value = { ...response.data }
    state.products = true
  } catch (error) {
    state.errors = error
    console.error('Error:', error)

    router.push('/')
  }
}

onMounted(() => {
  state.id = router.currentRoute.value.params.id
  fetchProductDetails(state.id)
})

const previewProductData = ref({ ...state.data })

const updatePreview = () => {
  previewProductData.value = {
    name: state.data.name,
    description: state.data.description,
    quantity: state.data.quantity,
    price: state.data.price,
    photo: state.data.photo ? URL.createObjectURL(state.data.photo) : state.data.photo
  };
};

const updateProduct = async () => {
  try {
    // Update non-photo fields
    const response = await fetch(`http://127.0.0.1:8000/api/products/${state.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: "Bearer " + localStorage.getItem('_token')
      },
      body: JSON.stringify({
        name: state.data.name,
        description: state.data.description,
        quantity: state.data.quantity,
        price: state.data.price
      })
    })

    if (!response.ok) {
      throw new Error('Failed to update product')
    }

    alert("Product details successfully updated!")
    console.log('Product updated:', await response.json())

    router.push('/products')
  } catch (error) {
    state.errors = error.message
    console.error('Error updating product:', error)
  }
}

const updatePhoto = async () => {
  try {
    // Submit photo using POST request
    const formData = new FormData()
    formData.append('photo', state.data.photo)

    const response = await fetch(`http://127.0.0.1:8000/api/products/${state.id}/photo`, {
      method: 'POST',
      headers: {
        Authorization: "Bearer " + localStorage.getItem('_token')
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error('Failed to update photo')
    }
    
    console.log('Photo updated:', await response.json())
    window.location.reload();
  } catch (error) {
    state.errors = error.message
    console.error('Error updating photo:', error)
  }
}

const cancelUpdate = () => {
  router.push('/products');
}

const uploadData = async () => {
  await updateProduct();
  await updatePhoto();
}
</script>
