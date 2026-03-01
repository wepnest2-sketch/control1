import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/Card';
import { Plus, Trash2, Layers } from 'lucide-react';

export function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      const { error } = await supabase
        .from('categories')
        .insert([{ name: newCategory }]);

      if (error) throw error;
      setNewCategory('');
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-serif font-bold text-gray-900">التصنيفات</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Add Category Form */}
        <Card className="md:col-span-1 h-fit">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Plus className="w-5 h-5" /> إضافة تصنيف جديد
            </h3>
            <form onSubmit={addCategory} className="space-y-4">
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="اسم التصنيف"
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

        {/* Categories List */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {loading ? (
            <p className="text-gray-500 col-span-2 text-center">جاري التحميل...</p>
          ) : categories.length === 0 ? (
            <p className="text-gray-500 col-span-2 text-center">لا توجد تصنيفات</p>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center group hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-400 group-hover:text-black transition-colors">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-gray-800">{category.name}</span>
                </div>
                <button 
                  onClick={() => deleteCategory(category.id)}
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
