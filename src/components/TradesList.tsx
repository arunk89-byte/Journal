import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, Image as ImageIcon, Trash2, Download } from 'lucide-react';
import { supabase, Trade } from '../lib/supabase';

interface TradesListProps {
  isDarkMode: boolean;
}

export default function TradesList({ isDarkMode }: TradesListProps) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchTrades = async () => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrades(data || []);
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  const calculateStats = () => {
    if (trades.length === 0) return { winRate: 0, lossRate: 0, totalTrades: 0, completedTrades: 0 };
    
    const winTrades = trades.filter(trade => trade.trade_result === 'Win').length;
    const lossTrades = trades.filter(trade => trade.trade_result === 'Loss').length;
    const completedTrades = winTrades + lossTrades; // Only Win + Loss trades
    const totalTrades = trades.length;
    
    // Calculate percentages based only on completed trades
    const winRate = completedTrades > 0 ? Math.round((winTrades / completedTrades) * 100) : 0;
    const lossRate = completedTrades > 0 ? Math.round((lossTrades / completedTrades) * 100) : 0;
    
    return { winRate, lossRate, totalTrades, completedTrades };
  };

  const stats = calculateStats();

  const exportTrades = () => {
    if (trades.length === 0) {
      alert('No trades to export');
      return;
    }

    // Create CSV content
    const headers = ['Date', 'Currency Pair', 'Order Type', 'Trade Result', 'Reason'];
    const csvContent = [
      headers.join(','),
      ...trades.map(trade => [
        formatDate(trade.created_at),
        `"${trade.pair}"`,
        trade.order_type,
        trade.trade_result,
        `"${trade.reason.replace(/"/g, '""')}"` // Escape quotes in reason
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `trade-journal-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async (trade: Trade) => {
    if (!window.confirm('Are you sure you want to delete this trade?')) return;
    // Delete image from storage if exists
    if (trade.image_url) {
      // Extract file name from image_url
      const parts = trade.image_url.split('/');
      const fileName = parts[parts.length - 1];
      await supabase.storage.from('trade-images').remove([fileName]);
    }
    // Delete trade from table
    await supabase.from('trades').delete().eq('id', trade.id);
    fetchTrades();
  };

  if (loading) {
    return (
      <div className={`rounded-xl shadow-lg p-8 transition-colors duration-200 ${
        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
      }`}>
        <div className="animate-pulse space-y-4">
          <div className={`h-6 rounded w-1/4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          <div className="space-y-3">
            <div className={`h-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
            <div className={`h-4 rounded w-5/6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
            <div className={`h-4 rounded w-4/6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`rounded-xl shadow-lg p-8 transition-colors duration-200 ${
        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
      }`}>
        <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Trade History
        </h2>
        
        {/* Export Button */}
        {trades.length > 0 && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={exportTrades}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Download className="w-4 h-4" />
              Export Trades
            </button>
          </div>
        )}
        
        {/* Statistics Section */}
        {trades.length > 0 && (
          <div className={`mb-6 p-4 rounded-lg transition-colors duration-200 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-gray-700 to-gray-600' 
              : 'bg-gradient-to-r from-blue-50 to-indigo-50'
          }`}>
            <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Trading Statistics
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.winRate}%</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Win Rate</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>({stats.completedTrades} completed)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.lossRate}%</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loss Rate</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>({stats.completedTrades} completed)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalTrades}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Trades</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>({stats.completedTrades} completed)</div>
              </div>
            </div>
          </div>
        )}
        
        {trades.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No trades recorded yet</p>
            <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Start by adding your first trade above</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trades.map((trade) => (
              <div
                key={trade.id}
                className={`border rounded-lg p-3 hover:shadow-md transition-all ${
                  isDarkMode 
                    ? 'border-gray-700 hover:border-gray-600' 
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-semibold truncate ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        {trade.pair}
                      </span>
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        trade.order_type === 'Buy' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {trade.order_type === 'Buy' ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {trade.order_type}
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        trade.trade_result === 'Win' 
                          ? 'bg-green-100 text-green-700' 
                          : trade.trade_result === 'Loss'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {trade.trade_result}
                      </div>
                      <button
                        className="text-red-500 hover:text-red-700 ml-auto"
                        title="Delete trade"
                        onClick={() => handleDelete(trade)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="mb-1">
                      <p className={`text-sm leading-relaxed line-clamp-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>{trade.reason}</p>
                    </div>
                    
                    <div className={`flex items-center gap-1 text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <Calendar className="w-4 h-4" />
                      {formatDate(trade.created_at)}
                    </div>
                  </div>
                  
                  {trade.image_url && (
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => setSelectedImage(trade.image_url!)}
                        className="group relative block"
                      >
                        <img
                          src={trade.image_url}
                          alt="Trade chart"
                          className={`w-16 h-12 object-cover rounded border transition-colors ${
                            isDarkMode 
                              ? 'border-gray-600 group-hover:border-blue-400' 
                              : 'border-gray-200 group-hover:border-blue-400'
                          }`}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded transition-all flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Trade chart full size"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
}