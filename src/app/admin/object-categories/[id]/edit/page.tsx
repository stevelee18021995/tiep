"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ObjectCategory, Category } from '@/types';
import AdminLayout from '@/components/layout/AdminLayout';
import AuthGuard from '@/components/AuthGuard';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2,
  Package,
  FileText,
  Tag,
  Hash,
  Settings,
  Activity,
  AlertCircle
} from 'lucide-react';

const objectCategorySchema = z.object({
  name: z.string().min(1, 'Tên danh mục đối tượng là bắt buộc'),
  slug: z.string().min(1, 'Slug là bắt buộc'),
  description: z.string().optional(),
  category_id: z.string().min(1, 'Vui lòng chọn danh mục cha'),
  active: z.boolean(),
  properties: z.array(z.object({
    key: z.string().min(1, 'Tên thuộc tính là bắt buộc'),
    value: z.string().min(1, 'Giá trị thuộc tính là bắt buộc')
  }))
});

type FormData = z.infer<typeof objectCategorySchema>;

export default function EditObjectCategoryPage() {
  return (
    <AuthGuard requireAuth={true} requireAdmin={true}>
      <AdminLayout>
        <EditObjectCategoryContent />
      </AdminLayout>
    </AuthGuard>
  );
}

function EditObjectCategoryContent() {
  const params = useParams();
  const router = useRouter();
  const objectCategoryId = params.id as string;
  
  const [objectCategory, setObjectCategory] = useState<ObjectCategory | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<FormData>({
    resolver: zodResolver(objectCategorySchema),
    defaultValues: {
      properties: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "properties"
  });

  const watchName = watch('name');

  // Auto-generate slug from name
  useEffect(() => {
    if (watchName && objectCategory) {
      const slug = watchName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setValue('slug', slug);
    }
  }, [watchName, setValue, objectCategory]);

  // Fetch object category details and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch object category details
        const objectCategoryResponse = await fetch(`/api/object-categories/${objectCategoryId}`);
        if (!objectCategoryResponse.ok) {
          throw new Error('Failed to fetch object category');
        }
        
        const objectCategoryResult = await objectCategoryResponse.json();
        const objectCategoryData = objectCategoryResult.data || objectCategoryResult;
        setObjectCategory(objectCategoryData);

        // Fetch categories for dropdown
        const categoriesResponse = await fetch('/api/categories');
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const categoriesResult = await categoriesResponse.json();
        const categoriesData = categoriesResult.data || categoriesResult;
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);

        // Populate form with object category data
        const propertiesArray = objectCategoryData.properties 
          ? Object.entries(objectCategoryData.properties).map(([key, value]) => ({
              key,
              value: String(value)
            }))
          : [];

        reset({
          name: objectCategoryData.name,
          slug: objectCategoryData.slug,
          description: objectCategoryData.description || '',
          category_id: String(objectCategoryData.category_id),
          active: objectCategoryData.active,
          properties: propertiesArray
        });

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Không thể tải thông tin danh mục đối tượng');
      } finally {
        setLoading(false);
      }
    };

    if (objectCategoryId) {
      fetchData();
    }
  }, [objectCategoryId, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setSubmitting(true);
      setError(null);

      // Convert properties array to object
      const propertiesObject = data.properties.reduce((acc, prop) => {
        if (prop.key && prop.value) {
          acc[prop.key] = prop.value;
        }
        return acc;
      }, {} as Record<string, string>);

      const requestBody = {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        category_id: parseInt(data.category_id),
        active: data.active,
        properties: Object.keys(propertiesObject).length > 0 ? propertiesObject : null
      };

      const response = await fetch(`/api/object-categories/${objectCategoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update object category');
      }

      router.push(`/admin/object-categories/${objectCategoryId}`);
    } catch (err) {
      console.error('Error updating object category:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật danh mục đối tượng');
    } finally {
      setSubmitting(false);
    }
  };

  const addProperty = () => {
    append({ key: '', value: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin danh mục đối tượng...</p>
        </div>
      </div>
    );
  }

  if (!objectCategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg">Không thể tải thông tin danh mục đối tượng</p>
          <Link
            href="/admin/object-categories"
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 inline-block"
          >
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href={`/admin/object-categories/${objectCategoryId}`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Quay lại chi tiết
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
              {objectCategory.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Chỉnh sửa danh mục đối tượng
              </h1>
              <p className="text-gray-600">Cập nhật thông tin danh mục đối tượng "{objectCategory.name}"</p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-green-500" />
                Thông tin cơ bản
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên danh mục đối tượng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập tên danh mục đối tượng"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('slug')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    placeholder="slug-danh-muc-doi-tuong"
                  />
                  {errors.slug && (
                    <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    Danh mục cha <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('category_id')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Chọn danh mục cha --</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    Trạng thái
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('active')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-900">
                      Kích hoạt danh mục đối tượng
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Mô tả
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập mô tả cho danh mục đối tượng (tùy chọn)"
                />
              </div>
            </div>
          </div>

          {/* Properties */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-500" />
                  Thuộc tính tùy chỉnh
                </h2>
                <button
                  type="button"
                  onClick={addProperty}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Thêm thuộc tính
                </button>
              </div>
            </div>
            <div className="p-6">
              {fields.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Settings className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Chưa có thuộc tính nào</p>
                  <p className="text-sm">Nhấp "Thêm thuộc tính" để bắt đầu</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-4 items-start p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <input
                          {...register(`properties.${index}.key`)}
                          placeholder="Tên thuộc tính"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        {errors.properties?.[index]?.key && (
                          <p className="mt-1 text-xs text-red-600">{errors.properties[index]?.key?.message}</p>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          {...register(`properties.${index}.value`)}
                          placeholder="Giá trị thuộc tính"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        {errors.properties?.[index]?.value && (
                          <p className="mt-1 text-xs text-red-600">{errors.properties[index]?.value?.message}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="flex items-center justify-center w-10 h-10 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href={`/admin/object-categories/${objectCategoryId}`}
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Cập nhật danh mục đối tượng
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
