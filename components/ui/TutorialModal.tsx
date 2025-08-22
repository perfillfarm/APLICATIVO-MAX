import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { X, Play, Maximize } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInDown, 
  SlideOutDown,
  ZoomIn,
  ZoomOut
} from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface TutorialModalProps {
  visible: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(true);

  const handleClose = () => {
    setIsFullscreen(false);
    setVideoLoaded(true);
    console.log('🚪 [TutorialModal] User closed tutorial - marking as completed PERMANENTLY in Firebase');
    onClose();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getTitle = () => {
    return language === 'pt' 
      ? 'Max Testorin Tracker!'
      : 'Max Testorin Tracker!';
  };

  const getSubtitle = () => {
    return language === 'pt'
      ? 'Assista este tutorial rápido para aproveitar ao máximo seu aplicativo'
      : 'Watch this quick tutorial to get the most out of your app';
  };

  const getSkipText = () => {
    return language === 'pt' ? 'Pular Tutorial' : 'Skip Tutorial';
  };

  const getWatchLaterText = () => {
    return language === 'pt' ? 'Assistir Depois' : 'Watch Later';
  };

  // HTML content with ConverteAI script
  const getVideoHTML = () => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: ${theme.colors.background};
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          width: 100%;
          height: 100vh;
          overflow: hidden;
        }
        #video-container {
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          box-sizing: border-box;
        }
        .video-wrapper {
          margin: 0 auto;
          width: 100%;
          height: 100%;
          max-width: none;
        }
        .video-aspect {
          padding: 0 !important;
          height: 100% !important;
          position: relative !important;
        }
        .video-iframe {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          border: none !important;
          border-radius: ${isFullscreen ? '0' : '12px'} !important;
        }
      </style>
    </head>
    <body>
      <div id="video-container">
        <div class="video-wrapper" style="margin: 0; width: 100%; height: 100%;">
          <div style="padding: 0; position: relative; height: 100%;" class="video-aspect">
            <iframe 
              frameborder="0" 
              allowfullscreen 
              src="https://scripts.converteai.net/f5ab9e88-cc1b-4dce-a537-c7de7e019d8b/players/68793a61c7480bfbfa36885e/v4/embed.html" 
              class="video-iframe" 
              style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: ${isFullscreen ? '0' : '12px'};" 
              referrerpolicy="origin" 
              loading="lazy">
            </iframe>
          </div>
        </div>
      </div>
      
      <script type="text/javascript">
        var s=document.createElement("script"); 
        s.src="https://scripts.converteai.net/lib/js/smartplayer-wc/v4/sdk.js", 
        s.async=!0,
        document.head.appendChild(s);
      </script>
    </body>
    </html>
  `;

  const renderVideoContent = () => (
    <View style={[
      styles.videoContainer,
      isFullscreen && styles.fullscreenVideoContainer
    ]}>
      {/* ConverteAI Video Player */}
      <iframe
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: isFullscreen ? 0 : 16,
        }}
        srcDoc={getVideoHTML()}
        allowFullScreen
        allow="autoplay; encrypted-media; picture-in-picture"
        sandbox="allow-scripts allow-same-origin allow-presentation"
      />

    </View>
  );

  if (isFullscreen) {
    return (
      <Modal
        visible={visible}
        transparent={false}
        animationType="none"
        onRequestClose={toggleFullscreen}
        statusBarTranslucent
      >
        <Animated.View
          entering={ZoomIn.duration(300)}
          exiting={ZoomOut.duration(200)}
          style={[styles.fullscreenContainer, { backgroundColor: '#000000' }]}
        >
          {/* Fullscreen Close Button */}
          <TouchableOpacity
            style={styles.fullscreenCloseButton}
            onPress={toggleFullscreen}
          >
            <X size={24} color="#ffffff" />
          </TouchableOpacity>

          {renderVideoContent()}
        </Animated.View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        {/* Background Overlay */}
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          style={styles.overlay}
        />
        
        {/* Modal Content */}
        <Animated.View
          entering={SlideInDown.springify().damping(15)}
          exiting={SlideOutDown.duration(300)}
          style={[styles.modalContent, { backgroundColor: theme.colors.card }]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.titleSection}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {getTitle()}
              </Text>
              <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
                {getSubtitle()}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.colors.background }]}
              onPress={handleClose}
            >
              <X size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Video Content */}
          {renderVideoContent()}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border 
                }
              ]}
              onPress={handleClose}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.colors.textSecondary }]}>
                {getWatchLaterText()}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleClose}
            >
              <Text style={styles.primaryButtonText}>
                {getSkipText()}
              </Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 50,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    width: '100%',
    maxWidth: 600,
    maxHeight: '95%',
    minHeight: '90%',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    zIndex: 1000,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 12,
  },
  titleSection: {
    flex: 1,
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
    lineHeight: 24,
  },
  modalSubtitle: {
    fontSize: 16,
    lineHeight: 20,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  videoContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    height: 380,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    maxWidth: '100%',
  },
  fullscreenVideoContainer: {
    margin: 0,
    borderRadius: 0,
    height: '100%',
    width: '100%',
  },
  videoPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  fullscreenButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 18,
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  fullscreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});