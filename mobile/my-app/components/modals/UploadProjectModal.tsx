// components/modals/UploadProjectModal.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  BackHandler,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { uploadToCloudinary } from '../../app/services/cloudinary';
import { createProject, getCurrentUserYear } from '../../app/services/projectApi';
import { auth } from '../../backend/firebase';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '../../constants/theme';

const TAGS = ["Business", "Education", "E-commerce", "Entertainment", "Blog"];
const CATEGORIES = [
  "Web", "Mobile", "Desktop", "AI / ML",
  "Embedded / IoT", "Game Dev", "Blockchain", "Cloud / DevOps",
];
const TECH_STACKS = [
  "React", "Vue", "Angular", "Next.js", "Flutter", "React Native",
  "Node.js", "Python", "Firebase", "MongoDB", "Docker", "Tailwind CSS",
  "TensorFlow", "PyTorch", "AWS", "Express", "Laravel",
];
const STEPS = ["Basics", "Details", "Media"];

interface UploadProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function UploadProjectModal({ visible, onClose, onSuccess }: UploadProjectModalProps) {
  const { theme } = useTheme();
  const COLORS = Colors[theme];

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [github, setGithub] = useState('');
  const [tag, setTag] = useState('');
  const [category, setCategory] = useState('');
  const [techStack, setTechStack] = useState<string[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const hasData = () => {
    return name.trim() !== '' || 
           description.trim() !== '' || 
           github.trim() !== '' || 
           tag !== '' || 
           category !== '' || 
           techStack.length > 0 || 
           image !== null;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible && !success && hasData()) {
        setShowExitConfirm(true);
        return true;
      }
      return false;
    });
    return () => backHandler.remove();
  }, [visible, success, name, description, github, tag, category, techStack, image]);

  const toggleTech = (tech: string) => {
    setTechStack(prev =>
      prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
    );
    setErrors(prev => ({ ...prev, techStack: '' }));
  };

  const pickImage = async () => {
    Keyboard.dismiss();
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Please allow access to your photos to upload a project image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const selectedAsset = result.assets[0];
      setImageUri(selectedAsset.uri);
      setImage(selectedAsset.uri);
      setErrors(prev => ({ ...prev, image: '' }));
      console.log("📸 Image selected:", selectedAsset.uri);
    }
  };

  const isValidGithubLink = (url: string): boolean => {
    return url.trim().startsWith('https://github.com/');
  };

  const validateStep = (currentStep: number): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 0) {
      if (!name.trim()) newErrors.name = '✨ Project name is required';
      if (!description.trim()) newErrors.description = '📝 Description is required';
      if (!github.trim()) {
        newErrors.github = '🌸 GitHub link is required';
      } else if (!isValidGithubLink(github)) {
        newErrors.github = '🌸 Please enter a valid GitHub link (starts with https://github.com/)';
      }
    }
    if (currentStep === 1) {
      if (!tag) newErrors.tag = 'Please select a tag';
      if (!category) newErrors.category = 'Please select a category';
      if (techStack.length === 0) newErrors.techStack = 'Select at least one technology';
    }
    if (currentStep === 2) {
      if (!image) newErrors.image = 'Please add a project image';
    }
    return newErrors;
  };

  const handleNext = () => {
    Keyboard.dismiss();
    const validationErrors = validateStep(step);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      if (validationErrors.github && github.trim() !== '' && !isValidGithubLink(github)) {
        Toast.show({
          type: 'info',
          text1: '🌸 GitHub Link Needed',
          text2: 'Pretty please! Enter a valid GitHub repository link 💻✨',
          position: 'top',
          visibilityTime: 4000,
        });
      }
      return;
    }
    setErrors({});
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    Keyboard.dismiss();
    setErrors({});
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    const validationErrors = validateStep(2);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      if (validationErrors.github && github.trim() !== '' && !isValidGithubLink(github)) {
        Toast.show({
          type: 'info',
          text1: '🌸 Oops! Invalid GitHub Link',
          text2: 'Please enter a valid GitHub URL ✨',
          position: 'top',
          visibilityTime: 4000,
        });
      }
      return;
    }

    setSubmitting(true);
    
    Toast.show({
      type: 'info',
      text1: '📸 Uploading image...',
      text2: 'Please wait ✨',
      position: 'top',
      visibilityTime: 2000,
    });

    try {
      let imgUrl = '';
      if (imageUri) {
        try {
          console.log("📸 Starting image upload...");
          imgUrl = await uploadToCloudinary(imageUri);
          console.log("✅ Image uploaded:", imgUrl);
          
          Toast.show({
            type: 'success',
            text1: '✅ Image uploaded!',
            text2: 'Now submitting your project...',
            position: 'top',
            visibilityTime: 1500,
          });
          
        } catch (uploadError: any) {
          console.error("❌ Image upload error:", uploadError);
          Toast.show({
            type: 'error',
            text1: '🖼️ Image Upload Failed',
            text2: uploadError.message || 'Could not upload image. Please try again.',
            position: 'top',
            visibilityTime: 4000,
          });
          setSubmitting(false);
          return;
        }
      }

      const currentUser = auth.currentUser;
      if (!currentUser) {
        Toast.show({
          type: 'error',
          text1: '❌ Not logged in',
          text2: 'Please login to upload a project',
          position: 'top',
          visibilityTime: 3000,
        });
        setSubmitting(false);
        return;
      }

      const userYear = await getCurrentUserYear(currentUser.uid);

      const result = await createProject({
        title: name,
        desc: description,
        userId: currentUser.uid,
        year: userYear,
        stack: techStack,
        category: category,
        gitLink: github,
        imgUrl: imgUrl,
        tags: [tag],
      });

      if (result === 'add-fail') {
        setErrors({ submit: 'Something went wrong. Please try again.' });
        Toast.show({
          type: 'error',
          text1: '❌ Upload failed',
          text2: 'Something went wrong. Please try again.',
          position: 'top',
          visibilityTime: 3000,
        });
      } else {
        setSuccess(true);
        Toast.show({
          type: 'success',
          text1: '🎉 Project submitted!',
          text2: '✨ An admin will review it shortly ✨',
          position: 'top',
          visibilityTime: 3500,
        });
        
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2000);
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      setErrors({ submit: error.message || 'Upload failed. Please try again.' });
      Toast.show({
        type: 'error',
        text1: '❌ Upload failed',
        text2: error.message || 'Please check your connection and try again',
        position: 'top',
        visibilityTime: 4000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(0);
    setName('');
    setDescription('');
    setGithub('');
    setTag('');
    setCategory('');
    setTechStack([]);
    setImage(null);
    setImageUri(null);
    setErrors({});
    setSuccess(false);
    setShowExitConfirm(false);
  };

  const handleClose = () => {
    if (hasData() && !success) {
      setShowExitConfirm(true);
    } else {
      resetForm();
      onClose();
    }
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    resetForm();
    onClose();
  };

  const renderExitConfirm = () => (
    <Modal visible={showExitConfirm} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <View style={{ backgroundColor: COLORS.white, borderRadius: 20, padding: 24, width: '100%', maxWidth: 300 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.black, textAlign: 'center', marginBottom: 12 }}>
            Exit without saving?
          </Text>
          <Text style={{ fontSize: 14, color: COLORS.link, textAlign: 'center', marginBottom: 24 }}>
            Your project data will be lost.
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity 
              onPress={() => setShowExitConfirm(false)} 
              style={{ flex: 1, paddingVertical: 10, borderRadius: 25, borderWidth: 1, borderColor: COLORS.link, alignItems: 'center' }}
            >
              <Text style={{ color: COLORS.button }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={confirmExit} 
              style={{ flex: 1, backgroundColor: COLORS.error, paddingVertical: 10, borderRadius: 25, alignItems: 'center' }}
            >
              <Text style={{ color: COLORS.white, fontWeight: 'bold' }}>Exit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderStepper = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
      {STEPS.map((stepName, idx) => (
        <React.Fragment key={stepName}>
          <View style={{ alignItems: 'center', width: 64 }}>
            <View style={{
              width: 28, height: 28, borderRadius: 14, borderWidth: 2,
              borderColor: idx === step ? COLORS.button : (idx < step ? COLORS.button : COLORS.border),
              backgroundColor: idx === step ? COLORS.button : (idx < step ? COLORS.button : COLORS.bg),
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: (idx === step || idx < step) ? COLORS.white : COLORS.link }}>
                {idx < step ? '✓' : idx + 1}
              </Text>
            </View>
            <Text style={{ fontSize: 10, marginTop: 4, color: idx === step ? COLORS.button : COLORS.link, fontWeight: idx === step ? '700' : '500' }}>
              {stepName}
            </Text>
          </View>
          {idx < STEPS.length - 1 && (
            <View style={{ flex: 1, height: 2, backgroundColor: idx < step ? COLORS.button : COLORS.border }} />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  return (
    <>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
        <View style={{ flex: 1, backgroundColor: 'rgba(30,16,6,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ width: '100%', maxWidth: 520 }}
          >
            <View style={{ backgroundColor: COLORS.bg, borderRadius: 28, width: '100%', maxHeight: '90%', overflow: 'hidden' }}>
              
              <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
                <Text style={{ fontSize: 22, fontWeight: '700', color: COLORS.black, textAlign: 'center' }}>
                  ✨ Upload Project
                </Text>
                {renderStepper()}
              </View>

              <ScrollView 
                style={{ padding: 20 }} 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {success ? (
                  <View style={{ alignItems: 'center', justifyContent: 'center', minHeight: 250, paddingVertical: 40 }}>
                    <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: COLORS.button, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                      <Text style={{ fontSize: 32, color: COLORS.white }}>✓</Text>
                    </View>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: COLORS.black, marginBottom: 8 }}>Project submitted!</Text>
                    <Text style={{ fontSize: 14, color: COLORS.link, textAlign: 'center' }}>An admin will review it shortly ✨</Text>
                  </View>
                ) : (
                  <>
                    {step === 0 && (
                      <View style={{ gap: 20 }}>
                        <View>
                          <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.button, marginBottom: 6 }}>📦 Project Name <Text style={{ color: COLORS.error }}>*</Text></Text>
                          <TextInput 
                            style={{ backgroundColor: COLORS.input, borderRadius: 14, padding: 12, fontSize: 15, borderWidth: errors.name ? 1 : 0, borderColor: COLORS.error }}
                            placeholder="e.g. AI Robotics Research"
                            placeholderTextColor={COLORS.link}
                            value={name} 
                            onChangeText={text => { setName(text); setErrors(prev => ({ ...prev, name: '' })); }}
                            returnKeyType="next"
                            blurOnSubmit={false}
                          />
                          {errors.name && <Text style={{ color: COLORS.error, fontSize: 11, marginTop: 4 }}>{errors.name}</Text>}
                        </View>
                        
                        <View>
                          <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.button, marginBottom: 6 }}>📝 Description <Text style={{ color: COLORS.error }}>*</Text></Text>
                          <TextInput 
                            style={{ backgroundColor: COLORS.input, borderRadius: 14, padding: 12, fontSize: 15, minHeight: 100, textAlignVertical: 'top', borderWidth: errors.description ? 1 : 0, borderColor: COLORS.error }}
                            placeholder="Tell us about your project..."
                            placeholderTextColor={COLORS.link}
                            value={description} 
                            onChangeText={text => { setDescription(text); setErrors(prev => ({ ...prev, description: '' })); }}
                            multiline 
                            numberOfLines={4}
                            maxLength={500}
                          />
                          <Text style={{ fontSize: 11, color: COLORS.link, textAlign: 'right', marginTop: 4 }}>{description.length}/500</Text>
                          {errors.description && <Text style={{ color: COLORS.error, fontSize: 11, marginTop: 4 }}>{errors.description}</Text>}
                        </View>
                        
                        <View>
                          <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.button, marginBottom: 6 }}>🔗 GitHub Link <Text style={{ color: COLORS.error }}>*</Text></Text>
                          <TextInput 
                            style={{ 
                              backgroundColor: COLORS.input, 
                              borderRadius: 14, 
                              padding: 12, 
                              fontSize: 15, 
                              borderWidth: errors.github ? 1 : 0, 
                              borderColor: errors.github ? COLORS.error : (isValidGithubLink(github) && github ? COLORS.button : 0),
                            }}
                            placeholder="https://github.com/username/repo"
                            placeholderTextColor={COLORS.link}
                            value={github} 
                            onChangeText={text => { setGithub(text); setErrors(prev => ({ ...prev, github: '' })); }}
                            autoCapitalize="none"
                            returnKeyType="done"
                          />
                          
                          {errors.github ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, backgroundColor: '#FFF0F0', padding: 12, borderRadius: 14, gap: 10 }}>
                              <Text style={{ fontSize: 20 }}>🌸</Text>
                              <View style={{ flex: 1 }}>
                                <Text style={{ color: COLORS.error, fontSize: 13, fontWeight: '600' }}>Oopsie! Invalid GitHub Link</Text>
                                <Text style={{ color: COLORS.error, fontSize: 12, marginTop: 2 }}>Pretty please, enter a valid GitHub URL like: https://github.com/username/repo</Text>
                              </View>
                            </View>
                          ) : isValidGithubLink(github) && github.trim() !== '' ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, backgroundColor: '#E8F5E9', padding: 12, borderRadius: 14, gap: 10 }}>
                              <Text style={{ fontSize: 20 }}>✨🎉</Text>
                              <View style={{ flex: 1 }}>
                                <Text style={{ color: COLORS.button, fontSize: 13, fontWeight: '600' }}>Perfect GitHub Link!</Text>
                                <Text style={{ color: COLORS.link, fontSize: 12, marginTop: 2 }}>Yay! Your GitHub repository link is valid! 💻</Text>
                              </View>
                            </View>
                          ) : github.trim() !== '' && !isValidGithubLink(github) ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, backgroundColor: '#FFF8E1', padding: 12, borderRadius: 14, gap: 10 }}>
                              <Text style={{ fontSize: 20 }}>🤔💭</Text>
                              <View style={{ flex: 1 }}>
                                <Text style={{ color: '#E65100', fontSize: 13, fontWeight: '600' }}>Hmm... Not a GitHub Link?</Text>
                                <Text style={{ color: '#BF6F00', fontSize: 12, marginTop: 2 }}>GitHub links start with https://github.com/ — please double-check! 🌸</Text>
                              </View>
                            </View>
                          ) : null}
                        </View>
                      </View>
                    )}
                    
                    {step === 1 && (
                      <View style={{ gap: 20 }}>
                        <View>
                          <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.button, marginBottom: 6 }}>🏷️ Tag <Text style={{ color: COLORS.error }}>*</Text></Text>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                            {TAGS.map(t => (
                              <TouchableOpacity 
                                key={t} 
                                style={{ backgroundColor: tag === t ? COLORS.button : COLORS.chip, borderRadius: 25, paddingHorizontal: 16, paddingVertical: 8 }} 
                                onPress={() => { setTag(t); setErrors(prev => ({ ...prev, tag: '' })); }}
                              >
                                <Text style={{ color: tag === t ? COLORS.white : COLORS.button, fontWeight: '500', fontSize: 13 }}>{t}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                          {errors.tag && <Text style={{ color: COLORS.error, fontSize: 11, marginTop: 4 }}>{errors.tag}</Text>}
                        </View>
                        
                        <View>
                          <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.button, marginBottom: 6 }}>📂 Category <Text style={{ color: COLORS.error }}>*</Text></Text>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                            {CATEGORIES.map(c => (
                              <TouchableOpacity 
                                key={c} 
                                style={{ backgroundColor: category === c ? COLORS.button : COLORS.chip, borderRadius: 25, paddingHorizontal: 14, paddingVertical: 8 }} 
                                onPress={() => { setCategory(c); setErrors(prev => ({ ...prev, category: '' })); }}
                              >
                                <Text style={{ color: category === c ? COLORS.white : COLORS.button, fontSize: 12, fontWeight: '500' }}>{c}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                          {errors.category && <Text style={{ color: COLORS.error, fontSize: 11, marginTop: 4 }}>{errors.category}</Text>}
                        </View>
                        
                        <View>
                          <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.button, marginBottom: 6 }}>
                            💻 Tech Stack <Text style={{ color: COLORS.error }}>*</Text>
                            {techStack.length > 0 && <Text style={{ color: COLORS.link, fontSize: 11 }}> ({techStack.length} selected)</Text>}
                          </Text>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                            {TECH_STACKS.map(tech => (
                              <TouchableOpacity 
                                key={tech} 
                                style={{ backgroundColor: techStack.includes(tech) ? COLORS.button : COLORS.chip, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }} 
                                onPress={() => toggleTech(tech)}
                              >
                                <Text style={{ color: techStack.includes(tech) ? COLORS.white : COLORS.button, fontSize: 12 }}>{tech}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                          {errors.techStack && <Text style={{ color: COLORS.error, fontSize: 11, marginTop: 4 }}>{errors.techStack}</Text>}
                        </View>
                      </View>
                    )}
                    
                    {step === 2 && (
                      <View style={{ gap: 20 }}>
                        <View>
                          <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.button, marginBottom: 6 }}>🖼️ Project Image <Text style={{ color: COLORS.error }}>*</Text></Text>
                          <TouchableOpacity 
                            onPress={pickImage} 
                            style={{ borderWidth: 2, borderColor: errors.image ? COLORS.error : COLORS.link, borderStyle: 'dashed', borderRadius: 16, minHeight: 180, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
                          >
                            {imageUri ? (
                              <Image source={{ uri: imageUri }} style={{ width: '100%', height: 180 }} resizeMode="cover" />
                            ) : (
                              <View style={{ alignItems: 'center', padding: 32 }}>
                                <Text style={{ fontSize: 40, marginBottom: 8 }}>📷</Text>
                                <Text style={{ color: COLORS.button, fontWeight: '600', fontSize: 14 }}>Click to upload image</Text>
                                <Text style={{ color: COLORS.link, fontSize: 11, marginTop: 4 }}>PNG, JPG up to 5MB</Text>
                              </View>
                            )}
                          </TouchableOpacity>
                          {errors.image && <Text style={{ color: COLORS.error, fontSize: 11, marginTop: 4 }}>{errors.image}</Text>}
                        </View>
                        
                        <View style={{ backgroundColor: COLORS.input, borderRadius: 16, padding: 16, marginTop: 8 }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', color: COLORS.link, marginBottom: 12 }}>📋 Summary</Text>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text style={{ color: COLORS.link, fontSize: 13 }}>Name</Text>
                            <Text style={{ color: COLORS.black, fontWeight: '500', fontSize: 13, flex: 1, textAlign: 'right' }} numberOfLines={1}>{name || '—'}</Text>
                          </View>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text style={{ color: COLORS.link, fontSize: 13 }}>GitHub</Text>
                            <Text style={{ color: COLORS.button, fontSize: 12, flex: 1, textAlign: 'right' }} numberOfLines={1}>{github || '—'}</Text>
                          </View>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text style={{ color: COLORS.link, fontSize: 13 }}>Tag</Text>
                            <Text style={{ color: COLORS.black, fontWeight: '500', fontSize: 13 }}>{tag || '—'}</Text>
                          </View>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text style={{ color: COLORS.link, fontSize: 13 }}>Category</Text>
                            <Text style={{ color: COLORS.black, fontWeight: '500', fontSize: 13 }}>{category || '—'}</Text>
                          </View>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ color: COLORS.link, fontSize: 13 }}>Stack</Text>
                            <Text style={{ color: COLORS.black, fontWeight: '500', fontSize: 12, flex: 1, textAlign: 'right' }} numberOfLines={2}>{techStack.join(', ') || '—'}</Text>
                          </View>
                        </View>
                        
                        {errors.submit && <Text style={{ color: COLORS.error, fontSize: 13, textAlign: 'center', marginTop: 8 }}>{errors.submit}</Text>}
                      </View>
                    )}
                  </>
                )}
              </ScrollView>

              {!success && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 12 }}>
                  {step > 0 ? (
                    <TouchableOpacity onPress={handleBack} style={{ flex: 1, borderWidth: 1.5, borderColor: COLORS.link, borderRadius: 25, paddingVertical: 12, alignItems: 'center' }}>
                      <Text style={{ color: COLORS.button, fontWeight: '600' }}>← Back</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={handleClose} style={{ flex: 1, borderWidth: 1.5, borderColor: COLORS.link, borderRadius: 25, paddingVertical: 12, alignItems: 'center' }}>
                      <Text style={{ color: COLORS.button, fontWeight: '600' }}>Cancel</Text>
                    </TouchableOpacity>
                  )}
                  {step < 2 ? (
                    <TouchableOpacity onPress={handleNext} style={{ flex: 1, backgroundColor: COLORS.button, borderRadius: 25, paddingVertical: 12, alignItems: 'center' }}>
                      <Text style={{ color: COLORS.white, fontWeight: '700' }}>Next →</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={handleSubmit} disabled={submitting} style={{ flex: 1, backgroundColor: COLORS.button, borderRadius: 25, paddingVertical: 12, alignItems: 'center', opacity: submitting ? 0.6 : 1 }}>
                      {submitting ? (
                        <ActivityIndicator color={COLORS.white} size="small" />
                      ) : (
                        <Text style={{ color: COLORS.white, fontWeight: '700' }}>✨ Submit Project</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
      
      {renderExitConfirm()}
    </>
  );
}