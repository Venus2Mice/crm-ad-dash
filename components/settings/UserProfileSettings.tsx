
import React, { useState, useEffect } from 'react';
import { User } from '../../types';

interface UserProfileSettingsProps {
  currentUser: User;
  onSave: (updatedProfileData: Partial<Pick<User, 'name' | 'phone' | 'jobTitle' | 'avatarUrl'>>) => void;
}

const UserProfileSettings: React.FC<UserProfileSettingsProps> = ({ currentUser, onSave }) => {
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [jobTitle, setJobTitle] = useState(currentUser.jobTitle || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    setName(currentUser.name);
    setPhone(currentUser.phone || '');
    setJobTitle(currentUser.jobTitle || '');
    setAvatarPreview(currentUser.avatarUrl || null); // Set preview from current user
    setAvatarFile(null); // Reset file on current user change
  }, [currentUser]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert("File is too large. Please select an image smaller than 2MB.");
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert("Invalid file type. Please select an image (JPEG, PNG, GIF, WebP).");
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const profileUpdates: Partial<Pick<User, 'name' | 'phone' | 'jobTitle' | 'avatarUrl'>> = { name, phone, jobTitle };
    // If avatarFile is set, it means a new avatar was selected (and previewed via avatarPreview)
    // If avatarFile is null, but avatarPreview is different from currentUser.avatarUrl,
    // it could mean removal (avatarPreview would be null then if remove was clicked and saved)
    // or it means no change to avatar if avatarPreview still matches currentUser.avatarUrl.
    if (avatarFile || avatarPreview !== currentUser.avatarUrl) {
        profileUpdates.avatarUrl = avatarPreview || undefined; // Send undefined to signify removal if preview is null
    }
    onSave(profileUpdates);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null); // This will trigger the default ui-avatar on save
    // Immediately reflect removal intention in onSave by passing avatarUrl as null/undefined
    onSave({ name, phone, jobTitle, avatarUrl: undefined });
  };
  
  const commonInputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";
  const commonLabelStyle = "block text-sm font-medium text-gray-700";

  const currentDisplayAvatar = avatarPreview || currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random&color=fff&size=128`;

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div>
        <h3 className="text-lg font-semibold leading-6 text-gray-900">Personal Information</h3>
        <p className="mt-1 text-sm text-gray-500">Update your photo and personal details here.</p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Avatar Management Section */}
        <div className="flex items-center space-x-4">
            <img 
                src={currentDisplayAvatar}
                alt="User Avatar"
                className="h-20 w-20 rounded-full object-cover"
            />
            <div className="flex flex-col space-y-2">
                <label htmlFor="avatarUpload" className="cursor-pointer text-sm bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-3 rounded-md transition-colors text-center">
                    Change Avatar
                </label>
                <input type="file" id="avatarUpload" onChange={handleAvatarChange} className="hidden" accept="image/png, image/jpeg, image/gif, image/webp"/>
                {(currentUser.avatarUrl || avatarPreview) && (currentUser.avatarUrl !== `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random&color=fff&size=128` || avatarFile) && (
                    <button 
                        type="button" 
                        onClick={handleRemoveAvatar}
                        className="text-sm bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-3 rounded-md transition-colors"
                    >
                        Remove Avatar
                    </button>
                )}
            </div>
        </div>
         {avatarPreview && avatarFile && (
            <p className="text-xs text-gray-500">New avatar selected. Click "Save Profile" to apply.</p>
        )}


        <div>
          <label htmlFor="name" className={commonLabelStyle}>Full Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={commonInputStyle}
            required
          />
        </div>

        <div>
          <label htmlFor="email" className={commonLabelStyle}>Email (Login ID)</label>
          <input
            type="email"
            id="email"
            value={currentUser.email}
            className={`${commonInputStyle} bg-gray-100 cursor-not-allowed`}
            disabled
            readOnly
            aria-describedby="email-description"
          />
          <p className="mt-1 text-xs text-gray-500" id="email-description">
            Your email address is used for logging in and cannot be changed here.
          </p>
        </div>

        <div>
          <label htmlFor="phone" className={commonLabelStyle}>Phone Number</label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={commonInputStyle}
            placeholder="e.g., 555-123-4567"
          />
        </div>

        <div>
          <label htmlFor="jobTitle" className={commonLabelStyle}>Job Title</label>
          <input
            type="text"
            id="jobTitle"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className={commonInputStyle}
            placeholder="e.g., Sales Manager"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white font-semibold rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfileSettings;
