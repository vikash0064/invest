import mongoose from 'mongoose'

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB Connected')
  } catch (error) {
    console.error('MongoDB connection failed. Local file storage fallback will be active. Error:', error.message)
  }
}