import { defineEventHandler, H3Event, readMultipartFormData, createError } from 'h3'
import path from 'path'
import fs from 'fs'

export default defineEventHandler(async (event: H3Event) => {
    try {
        const files = await readMultipartFormData(event)
        if (!files) {
            return createError({ statusCode: 400, data: 'File is invalid.' })
        }

        const uploadedFilePaths: string[] = []

        files.forEach((file) => {
            const filePath = path.join(process.cwd(), 'public', file.filename as string)
            fs.writeFileSync(filePath, file.data as Buffer)
            uploadedFilePaths.push(`/${file.filename}`)
        })
        return uploadedFilePaths
    } catch (error) {
        return createError({ statusCode: 500, data: 'Something went wrong with the server.' })
    }
})
