<template>
  <div class="grid-cols-2 scrollbar-hide">
    <div class="flex items-center justify-center bg-gray-900">
      <div class="container px-4 mx-auto">
        <div class="flex items-center py-10">
          <div>
            <h1 class="text-3xl font-bold text-gray-100">Product List</h1>
          </div>
          <div class="flex justify-end grow">
            <nuxt-link to="/products/create" class="px-4 py-2 font-bold text-white transition-colors duration-300 ease-in-out bg-indigo-600 rounded hover:bg-indigo-500">
              Add Product
            </nuxt-link>
          </div>
        </div>
        <div v-if="state.isLoading"  class="flex items-center justify-center min-h-40">
          <Spinner :is-active="true" />
        </div>
        <div v-else-if="currentproducts.length" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div v-for="product in currentproducts" :key="product.id" class="flex flex-col p-4 bg-gray-800 rounded-lg shadow-sm ring-1 ring-gray-700 shadow-gray-700">
            <div>
              <img :src="getFullImageUrl(product.photo)" alt="Product Image" class="object-cover w-full h-32 rounded">
            </div>
            <div class="flex flex-col items-start flex-grow w-full mt-4">
              <h2 class="p-2 text-xl font-bold text-gray-100">{{ product.name }}</h2>
              <p class="p-2 text-gray-400">{{ product.description }}</p>
              <div class="p-2 text-gray-100">Quantity: {{ product.quantity }}</div>
              <div class="p-2 text-gray-100">Price: ${{ product.price }}</div>
              <div class="flex w-full mt-auto">
                <nuxt-link :to="`/products/${product.id}`">
                  <button class="px-4 py-2 font-bold text-gray-100 transition-colors duration-300 ease-in-out bg-indigo-600 rounded hover:bg-indigo-500">
                    Edit
                  </button>
                </nuxt-link>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <EmptyState />>
        </div>
        <pagination
          :totalItems="totalItems"
          :currentPage="state.currentPage"
          :itemsPerPage="state.itemsPerPage"
          @prevPage="prevPage"
          @nextPage="nextPage"/>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Spinner from '~/components/loading/Spinner.vue';
import Pagination from '~/components/pagination/index.vue'
import EmptyState from '~/components/form/EmptyState.vue';


const router = useRouter()

const state = reactive({
  products: [],
  errors: null,
  isLoading: false,
  currentPage: 1,
  itemsPerPage: 8,
})

const baseUrl = 'http://127.0.0.1:8000/'  // Base URL of your Laravel app

async function fetchProducts() {
  state.isLoading = true
  const headers = {
    Authorization: "Bearer " + localStorage.getItem('_token'),
    Accept: "application/json"
  }

  try {
    const response = await $fetch('http://127.0.0.1:8000/api/products', {
      method: 'GET',
      headers: headers
    })

    state.products = response.data
    console.log(response.data)
  } catch (error) {
    state.errors = error.response
    console.error(error.response)
    console.error('error', error)
    
    // Navigate to login page if not logged in
    if (error.response && error.response.status === 401) {
      router.push('/')
    } 
  } finally {
      state.isLoading = false
    }
}

function getFullImageUrl(photo) {
  console.log(baseUrl + photo)
  return baseUrl + photo
}

const totalPages = computed(() => Math.ceil(state.products.length / state.itemsPerPage))

const currentproducts = computed(() => {
  const start = (state.currentPage - 1) * state.itemsPerPage
  const end = start + state.itemsPerPage
  return state.products.slice(start, end)
})

const totalItems = computed(() => state.products.length)

const nextPage = () => {
  if (state.currentPage < totalPages.value) {
    state.currentPage++
  }
}

const prevPage = () => {
  if (state.currentPage > 1) {
    state.currentPage--
  }
}

onMounted(() => {
  fetchProducts()
})
</script>
