import React, { useState, useEffect, useRef } from 'react';
import { User, updateUserProfile } from '../services/firebase';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdate: () => void; // Trigger parent refresh
  language: 'ar' | 'en';
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdate,
  language
}) => {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved local image if exists on mount
  useEffect(() => {
    if (isOpen) {
        setDisplayName(user.displayName || '');
        const localImg = localStorage.getItem(`avatar_${user.uid}`);
        setPreviewImage(localImg || user.photoURL || null);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const t = {
    ar: {
      title: 'الملف الشخصي',
      nameLabel: 'الاسم الظاهر',
      photoLabel: 'الصورة الشخصية',
      uploadBtn: 'رفع صورة جديدة',
      removeBtn: 'حذف الصورة',
      save: 'حفظ التغييرات',
      cancel: 'إلغاء',
      saving: 'جاري الحفظ...',
    },
    en: {
      title: 'Edit Profile',
      nameLabel: 'Display Name',
      photoLabel: 'Profile Photo',
      uploadBtn: 'Upload New Photo',
      removeBtn: 'Remove Photo',
      save: 'Save Changes',
      cancel: 'Cancel',
      saving: 'Saving...',
    }
  }[language];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Basic check to avoid massive strings crashing localStorage (limit ~500KB roughly)
        if (base64.length > 5000000) {
            alert(language === 'ar' ? 'الصورة كبيرة جداً. يرجى اختيار صورة أصغر.' : 'Image too large. Please select a smaller one.');
            return;
        }
        setPreviewImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // 1. Update Name in Firebase
      await updateUserProfile(displayName);

      // 2. Save Image locally (Simulating backend storage)
      // Since Firebase Auth photoURL has length limits, we store the base64 in localStorage
      if (previewImage) {
          localStorage.setItem(`avatar_${user.uid}`, previewImage);
      } else {
          localStorage.removeItem(`avatar_${user.uid}`);
      }

      // 3. Trigger refresh
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Error updating profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
        </div>

        <div className="p-6 space-y-6">
            {/* Photo Section */}
            <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-800 shadow-md">
                        {previewImage ? (
                            <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-primary-600 flex items-center justify-center text-3xl text-white font-bold">
                                {displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors shadow-lg"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                        </svg>
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageChange} 
                        accept="image/*" 
                        className="hidden" 
                    />
                </div>
                <div className="flex gap-2">
                     <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-primary-600 dark:text-primary-400 font-bold hover:underline"
                    >
                        {t.uploadBtn}
                     </button>
                     {previewImage && (
                         <>
                            <span className="text-gray-300">|</span>
                            <button 
                                onClick={() => setPreviewImage(null)}
                                className="text-xs text-red-500 font-bold hover:underline"
                            >
                                {t.removeBtn}
                            </button>
                         </>
                     )}
                </div>
            </div>

            {/* Name Section */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.nameLabel}
                </label>
                <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                />
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-blue-500 shrink-0">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                 </svg>
                 <p className="text-xs text-blue-700 dark:text-blue-300">
                    {language === 'ar' ? 'سيتم تحديث اسمك في جميع المحادثات الجديدة.' : 'Your name will be updated in all new chats.'}
                 </p>
            </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
            <button 
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
                {t.cancel}
            </button>
            <button 
                onClick={handleSave}
                disabled={isLoading}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold text-sm transition-colors shadow-lg shadow-primary-500/20 flex items-center gap-2"
            >
                {isLoading && <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                {isLoading ? t.saving : t.save}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;