import { defineEventHandler, H3Event, readMultipartFormData, createError } from 'h3'
import path from 'path'
import fs from 'fs'

// Define the event handler
export default defineEventHandler(async (event: H3Event) => {
    try {
        // Read multipart form data
        const files = await readMultipartFormData(event)
        if (!files) {
            return createError({ statusCode: 400, data: 'File is invalid.' })
        }

        // Store uploaded file paths
        const uploadedFilePaths: string[] = []

        // Process each uploaded file
        files.forEach((file) => {
            const filePath = path.join(process.cwd(), 'public', file.filename as string)
            fs.writeFileSync(filePath, file.data as Buffer)
            uploadedFilePaths.push(file.filename as string)
        })
        return uploadedFilePaths
    } catch (error) {
        return createError({ statusCode: 500, data: 'Something went wrong with the server.' })
    }
})
