import React, { useState } from 'react';
import { Upload, TrendingUp, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TradeFormProps {
  onTradeAdded: () => void;
  isDarkMode: boolean;
}

const CURRENCY_PAIRS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD',
  'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'BTC/USDT', 'ETH/USDT',
  'BNB/USDT', 'ADA/USDT', 'SOL/USDT', 'DOT/USDT'
];

export default function TradeForm({ onTradeAdded, isDarkMode }: TradeFormProps) {
  const [formData, setFormData] = useState({
    pair: '',
    orderType: 'Buy' as 'Buy' | 'Sell',
    reason: '',
    tradeResult: 'Pending' as 'Win' | 'Loss' | 'Pending'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Removed file size limit
      setSelectedFile(file);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('trade-images')
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('trade-images')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.pair) {
      setError('Please select a currency pair');
      return;
    }
    if (!formData.reason.trim()) {
      setError('Please provide trade logic/reason');
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = null;
      
      // Upload image if selected
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
        if (!imageUrl) {
          setError('Failed to upload image. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }

      // Save trade to database
      const { error: dbError } = await supabase
        .from('trades')
        .insert({
          pair: formData.pair,
          order_type: formData.orderType,
          reason: formData.reason.trim(),
          image_url: imageUrl,
          trade_result: formData.tradeResult
        });

      if (dbError) {
        throw dbError;
      }

      // Reset form
      setFormData({ pair: '', orderType: 'Buy', reason: '', tradeResult: 'Pending' });
      setSelectedFile(null);
      setImagePreview(null);
      onTradeAdded();
      
    } catch (err) {
      console.error('Error saving trade:', err);
      setError('Failed to save trade. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`rounded-xl shadow-lg p-8 mb-8 transition-colors duration-200 ${
      isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
    }`}>
      <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${
        isDarkMode ? 'text-white' : 'text-gray-800'
      }`}>
        <TrendingUp className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
        New Trade Entry
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Currency Pair */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Currency Pair
          </label>
          <select
            value={formData.pair}
            onChange={(e) => setFormData({ ...formData, pair: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            required
          >
            <option value="">Select a currency pair</option>
            {CURRENCY_PAIRS.map((pair) => (
              <option key={pair} value={pair}>{pair}</option>
            ))}
          </select>
        </div>

        {/* Order Type */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Order Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="orderType"
                value="Buy"
                checked={formData.orderType === 'Buy'}
                onChange={(e) => setFormData({ ...formData, orderType: e.target.value as 'Buy' | 'Sell' })}
                className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
              />
              <span className={`ml-2 font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Buy</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="orderType"
                value="Sell"
                checked={formData.orderType === 'Sell'}
                onChange={(e) => setFormData({ ...formData, orderType: e.target.value as 'Buy' | 'Sell' })}
                className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
              />
              <span className={`ml-2 font-medium ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>Sell</span>
            </label>
          </div>
        </div>

        {/* Trade Logic/Reason */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Trade Logic/Reason
          </label>
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            rows={4}
            placeholder="Describe your trade setup, analysis, and reasoning..."
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            required
          />
        </div>

        {/* Trade Result */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Trade Result
          </label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="tradeResult"
                value="Win"
                checked={formData.tradeResult === 'Win'}
                onChange={(e) => setFormData({ ...formData, tradeResult: e.target.value as 'Win' | 'Loss' | 'Pending' })}
                className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
              />
              <span className={`ml-2 font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Win</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="tradeResult"
                value="Loss"
                checked={formData.tradeResult === 'Loss'}
                onChange={(e) => setFormData({ ...formData, tradeResult: e.target.value as 'Win' | 'Loss' | 'Pending' })}
                className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
              />
              <span className={`ml-2 font-medium ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>Loss</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="tradeResult"
                value="Pending"
                checked={formData.tradeResult === 'Pending'}
                onChange={(e) => setFormData({ ...formData, tradeResult: e.target.value as 'Win' | 'Loss' | 'Pending' })}
                className="w-4 h-4 text-gray-600 border-gray-300 focus:ring-gray-500"
              />
              <span className={`ml-2 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending</span>
            </label>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Chart Screenshot (Optional)
          </label>
          <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDarkMode 
              ? 'border-gray-600 hover:border-gray-500' 
              : 'border-gray-300 hover:border-gray-400'
          }`}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              {imagePreview ? (
                <div className="space-y-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mx-auto max-w-xs max-h-48 object-contain rounded"
                  />
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Click to change image
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className={`w-8 h-8 mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Click to upload an image
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    PNG, JPG up to 5MB
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : isDarkMode
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isSubmitting ? 'Saving Trade...' : 'Save Trade'}
        </button>
      </form>
    </div>
  );
}