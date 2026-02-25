import React, { useState } from 'react';
import axios from 'axios';
import Layout from '../components/dashboard/Layout';
import { FaCloudUploadAlt, FaSpinner } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_APP_BASE_URL;

const AddProducts = () => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [image, setImage] = useState(null);

  const [formData, setFormData] = useState({
    customId: '',
    brand: '',
    details: '',
    category: 'eyeglasses',
    price: '',
    originalPrice: '',
    colors: '',
    rating: '',
    reviews: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!image) {
      alert("Please upload an image.");
      return;
    }

    setLoading(true);
    const data = new FormData();

    // Append text fields
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    // Append image file
    data.append('image', image);

    try {
      
      const response = await axios.post(`${API_URL}/api/products/add`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === 201) {
        alert('Product Added Successfully!');
        // Reset form
        setFormData({
          customId: '', brand: '', details: '', category: 'eyeglasses',
          price: '', originalPrice: '', colors: '', rating: '', reviews: ''
        });
        setImage(null);
        setPreview(null);
      }
    } catch (error) {
      console.error("Upload Error:", error);
      alert(error.response?.data?.message || 'Error adding product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Product</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Custom ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Custom ID (e.g. eg-1)</label>
              <input type="text" name="customId" value={formData.customId} onChange={handleChange} required className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="eyeglasses">Eyeglasses</option>
                <option value="sunglasses">Sunglasses</option>
                <option value="contact-lenses">Contact Lenses</option>
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Brand Name</label>
              <input type="text" name="brand" value={formData.brand} onChange={handleChange} required className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            {/* Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Details</label>
              <input type="text" name="details" value={formData.details} onChange={handleChange} required className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Selling Price (₹)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} required className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            {/* Original Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Original Price (₹)</label>
              <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} required className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            {/* Colors */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Colors (comma separated)</label>
              <input type="text" name="colors" placeholder="#000000, #ff0000" value={formData.colors} onChange={handleChange} className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            {/* Rating & Reviews */}
            <div className="flex gap-2">
              <div className='w-1/2'>
                <label className="block text-sm font-medium text-gray-700">Rating</label>
                <input type="number" step="0.1" max="5" name="rating" value={formData.rating} onChange={handleChange} className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className='w-1/2'>
                <label className="block text-sm font-medium text-gray-700">Reviews Count</label>
                <input type="number" name="reviews" value={formData.reviews} onChange={handleChange} className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
          </div>

          {/* Image Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition relative">
            <input type="file" onChange={handleImageChange} className="hidden" id="file-upload" accept="image/*" />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
              {preview ? (
                <img src={preview} alt="Preview" className="h-40 object-contain mb-2 rounded-md shadow-sm" />
              ) : (
                <FaCloudUploadAlt className="text-4xl text-gray-400 mb-2" />
              )}
              <span className="text-gray-500 font-medium">{preview ? "Click to replace image" : "Upload Product Image"}</span>
            </label>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full text-white py-3 rounded-lg font-bold transition flex items-center justify-center gap-2
              ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? <><FaSpinner className="animate-spin" /> Processing...</> : "Add Product"}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default AddProducts;