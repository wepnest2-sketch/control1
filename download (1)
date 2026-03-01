import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/Card';
import { Plus, Trash2, MapPin } from 'lucide-react';

export function Wilayas() {
  const [wilayas, setWilayas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', shipping_cost: '' });

  useEffect(() => {
    fetchWilayas();
  }, []);

  async function fetchWilayas() {
    try {
      const { data, error } = await supabase
        .from('wilayas')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setWilayas(data || []);
    } catch (error) {
      console.error('Error fetching wilayas:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addWilaya(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const { error } = await supabase
        .from('wilayas')
        .insert([{ 
          name: formData.name, 
          shipping_cost: parseFloat(formData.shipping_cost) || 0 
        }]);

      if (error) throw error;
      setFormData({ name: '', shipping_cost: '' });
      fetchWilayas();
    } catch (error) {
      console.error('Error adding wilaya:', error);
    }
  }

  async function deleteWilaya(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذه الولاية؟')) return;
    try {
      const { error } = await supabase
        .from('wilayas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchWilayas();
    } catch (error) {
      console.error('Error deleting wilaya:', error);
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-serif font-bold text-gray-900">الولايات والتوصيل</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Add Wilaya Form */}
        <Card className="md:col-span-1 h-fit">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Plus className="w-5 h-5" /> إضافة ولاية جديدة
            </h3>
            <form onSubmit={addWilaya} className="space-y-4">
              <input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="اسم الولاية"
                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
              />
              <input
                type="number"
                value={formData.shipping_cost}
                onChange={(e) => setFormData({...formData, shipping_cost: e.target.value})}
                placeholder="سعر التوصيل (د.ج)"
                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
              />
              <button 
                type="submit"
                className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-colors shadow-lg font-medium"
              >
                إضافة
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Wilayas List */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <p className="text-gray-500 col-span-3 text-center">جاري التحميل...</p>
          ) : wilayas.length === 0 ? (
            <p className="text-gray-500 col-span-3 text-center">لا توجد ولايات</p>
          ) : (
            wilayas.map((wilaya) => (
              <div key={wilaya.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center group hover:shadow-md transition-all">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="font-bold text-gray-800">{wilaya.name}</span>
                  </div>
                  <span className="text-xs text-gray-500 mr-6">{wilaya.shipping_cost} د.ج</span>
                </div>
                <button 
                  onClick={() => deleteWilaya(wilaya.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
