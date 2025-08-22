import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, Shield, Truck, Clock, CreditCard, Zap, Award, ShoppingCart } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import Animated, { FadeInDown, FadeInUp, SlideInRight, BounceIn } from 'react-native-reanimated';

interface ProductPackage {
  id: string;
  bottles: number;
  title: string;
  originalPrice: number;
  salePrice: number;
  savings: number;
  pricePerBottle: number;
  badge?: string;
  badgeColor?: string;
  isPopular?: boolean;
}

export default function ShopScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [selectedPackage, setSelectedPackage] = useState<string>('6-bottle');

  const packages: ProductPackage[] = [
    {
      id: '6-bottle',
      bottles: 6,
      title: t('maxTestorin6BottlePackage'),
      originalPrice: 594,
      salePrice: 294,
      savings: 300,
      pricePerBottle: 49,
      badge: t('bestValue'),
      badgeColor: '#F59E0B',
      isPopular: true,
    },
    {
      id: '3-bottle',
      bottles: 3,
      title: t('maxTestorin3BottlePackage'),
      originalPrice: 396,
      salePrice: 198,
      savings: 198,
      pricePerBottle: 66,
    },
    {
      id: '1-bottle',
      bottles: 1,
      title: t('maxTestorin1BottlePackage'),
      originalPrice: 168,
      salePrice: 89,
      savings: 79,
      pricePerBottle: 89,
    },
  ];

  const selectedPkg = packages.find(pkg => pkg.id === selectedPackage);

  const handlePurchase = async (packageId: string) => {
    try {
      // Links de compra para cada pacote
      const purchaseLinks = {
        '6-bottle': 'https://pay.hotmart.com/V92841227Y?checkoutMode=10',
        '3-bottle': 'https://pay.hotmart.com/V92841227Y?checkoutMode=10&quantity=3',
        '1-bottle': 'https://pay.hotmart.com/V92841227Y?checkoutMode=10&quantity=1'
      };
      
      const paymentUrl = purchaseLinks[packageId as keyof typeof purchaseLinks] || purchaseLinks['6-bottle'];
      
      console.log(`🛒 [Shop] Opening purchase link for ${packageId}:`, paymentUrl);
      
      const supported = await Linking.canOpenURL(paymentUrl);
      
      if (supported) {
        await Linking.openURL(paymentUrl);
        console.log(`✅ [Shop] Successfully opened purchase link for ${packageId}`);
      } else {
        console.error(`❌ [Shop] Cannot open URL: ${paymentUrl}`);
        Alert.alert(
          t('error'),
          'Could not open payment link. Please try again or contact support.',
          [{ text: t('ok') }]
        );
      }
    } catch (error) {
      console.error('❌ [Shop] Error opening payment link:', error);
      Alert.alert(
        t('error'),
        'Error opening payment link. Please check your internet connection and try again.',
        [{ text: t('ok') }]
      );
    }
  };

  const ProductCard = ({ pkg, isMain = false }: { pkg: ProductPackage; isMain?: boolean }) => (
    <>
    {isMain ? (
      <LinearGradient
        colors={['#dc2626', '#991b1b']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.productCard,
          styles.mainProductCard,
        ]}
      >
        <View style={styles.productImageContainer}>
          {pkg.id === '3-bottle' ? (
            <Image
              source={require('@/assets/images/MAX-3-BOTTLE.png')}
              style={styles.bottlesImage}
              resizeMode="contain"
            />
          ) : pkg.id === '1-bottle' ? (
            <Image
              source={require('@/assets/images/MAX-1-BOTTLE.png')}
              style={styles.bottlesImage}
              resizeMode="contain"
            />
          ) : (
            <Image
              source={require('@/assets/images/MAX-6-BOTTLE.png')}
              style={[styles.bottlesImage, { width: 320, height: 160 }]}
              resizeMode="contain"
            />
          )}
        </View>

        <Text style={[
          styles.productTitle,
          { color: '#ffffff' }
        ]}>
          {pkg.title}
        </Text>

        <Text style={styles.savingsText}>
          <Text style={{ color: '#f5bb0b', fontWeight: '700' }}>{t('youAreSaving')}{pkg.savings}</Text>
        </Text>

        <View style={styles.priceContainer}>
          <Text style={[
            styles.priceText,
            { color: '#ffffff' }
          ]}>
            {t('onlyPerBottle')}{pkg.pricePerBottle} {t('perBottle')}, ${pkg.salePrice} {t('total')}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => handlePurchase(pkg.id)}
        >
          <View style={[styles.buyButton, { backgroundColor: '#F59E0B' }]}>
            <Text style={styles.buyButtonText}>
              {t('claimOfferNow')}
            </Text>
          </View>
        </TouchableOpacity>
      </LinearGradient>
    ) : (
      <View 
      style={[
        styles.productCard,
        { backgroundColor: theme.colors.card }
      ]}>
        <View style={styles.productImageContainer}>
          {pkg.id === '3-bottle' ? (
            <Image
              source={require('@/assets/images/MAX-3-BOTTLE.png')}
              style={styles.bottlesImage}
              resizeMode="contain"
            />
          ) : pkg.id === '1-bottle' ? (
            <Image
              source={require('@/assets/images/MAX-1-BOTTLE.png')}
              style={styles.bottlesImage}
              resizeMode="contain"
            />
          ) : (
            <Image
              source={require('@/assets/images/MAX-6-BOTTLE.png')}
              style={[styles.bottlesImage, { width: 320, height: 160 }]}
              resizeMode="contain"
            />
          )}
        </View>

        <Text style={[
          styles.productTitle,
          { color: theme.colors.text }
        ]}>
          {pkg.title}
        </Text>

        <View style={styles.priceContainer}>
          <Text style={[
            styles.priceText,
            { color: theme.colors.text }
          ]}>
            {t('onlyPerBottle')}{pkg.pricePerBottle} {t('perBottle')}, ${pkg.salePrice} {t('total')}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => handlePurchase(pkg.id)}
        >
          <LinearGradient
            colors={['#e90101', '#960000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buyButton}
          >
            <Text style={styles.buyButtonText}>
              {t('buyNow')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={[styles.packagePrice, { color: theme.colors.textSecondary }]}>
          ${pkg.pricePerBottle} {t('perBottle')}{'\n'}${pkg.salePrice} {t('total')}
        </Text>

        <Text style={[styles.savingsSmall, { color: theme.colors.success }]}>
          {t('save')}{pkg.savings}
        </Text>
      </View>
    )}
    </>
  );

  const FeatureItem = ({ icon: Icon, text }: { icon: any; text: string }) => (
    <View style={styles.featureItem}>
      <Icon size={20} color="#ffffff" />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header 
        title={
          <View style={styles.headerTitleContainer}>
            <ShoppingCart size={24} color="#ffffff" style={styles.headerIcon} />
            <Text style={styles.headerTitleText}>Shop</Text>
          </View>
        }
        subtitle="Continue your treatment"
        showOptions={false}
      />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        overScrollMode="never"
      >
        
        {/* Main Product Card */}
        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.mainSection}>
          <ProductCard pkg={packages[0]} isMain={true} />
        </Animated.View>

        {/* Other Packages */}
        <Animated.View entering={SlideInRight.delay(400).springify()} style={styles.otherPackages}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('otherAvailablePackages')}
          </Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.packagesScroll}
            contentContainerStyle={styles.packagesScrollContent}
            bounces={false}
            overScrollMode="never"
            decelerationRate="fast"
            snapToInterval={280}
            snapToAlignment="start"
          >
            <ProductCard pkg={packages[1]} />
            <ProductCard pkg={packages[2]} />
          </ScrollView>
        </Animated.View>

        {/* Swipe Hint */}
        <Animated.View entering={BounceIn.delay(600)} style={styles.swipeHint}>
          <Text style={[styles.swipeHintText, { color: theme.colors.textSecondary }]}>
            👈 {t('swipeToSeeMore')} 👉
          </Text>
        </Animated.View>

        {/* Features Section */}
        <Animated.View entering={FadeInDown.delay(800).springify()} style={{ marginTop: 40 }}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, marginHorizontal: 20, marginBottom: 16 }]}>
            {t('featuresGuarantees')}
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
            bounces={false}
            overScrollMode="never"
            decelerationRate="fast"
          >
            <View style={styles.horizontalContent}>
              <Card style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Clock size={24} color="#F59E0B" />
                  <Text style={[styles.featureText, { color: theme.colors.text }]}>{t('dayGuarantee')}</Text>
                </View>
              </Card>
              <Card style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Truck size={24} color="#10B981" />
                  <Text style={[styles.featureText, { color: theme.colors.text }]}>{t('freeShip')}</Text>
                </View>
              </Card>
              <Card style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Shield size={24} color="#8B5CF6" />
                  <Text style={[styles.featureText, { color: theme.colors.text }]}>{t('secure')}</Text>
                </View>
              </Card>
              <Card style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Shield size={24} color="#EF4444" />
                  <Text style={[styles.featureText, { color: theme.colors.text }]}>SSL</Text>
                </View>
              </Card>
              <Card style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Clock size={24} color="#6366F1" />
                  <Text style={[styles.featureText, { color: theme.colors.text }]}>24/7</Text>
                </View>
              </Card>
            </View>
          </ScrollView>
        </Animated.View>

        {/* Payment Methods */}
        <Animated.View entering={FadeInDown.delay(1000).springify()} style={{ marginTop: 40 }}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, marginHorizontal: 20, marginBottom: 16 }]}>
            {t('paymentMethods')}
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
            bounces={false}
            overScrollMode="never"
            decelerationRate="fast"
          >
            <View style={styles.horizontalContent}>
              <Card style={styles.paymentCard}>
                <View style={styles.paymentIcon}>
                  <CreditCard size={24} color={theme.colors.primary} />
                  <Text style={[styles.paymentText, { color: theme.colors.text }]}>VISA</Text>
                </View>
              </Card>
              <Card style={styles.paymentCard}>
                <View style={styles.paymentIcon}>
                  <CreditCard size={24} color="#EB001B" />
                  <Text style={[styles.paymentText, { color: theme.colors.text }]}>Mastercard</Text>
                </View>
              </Card>
              <Card style={styles.paymentCard}>
                <View style={styles.paymentIcon}>
                  <CreditCard size={24} color="#FF5F00" />
                  <Text style={[styles.paymentText, { color: theme.colors.text }]}>Discover</Text>
                </View>
              </Card>
              <Card style={styles.paymentCard}>
                <View style={styles.paymentIcon}>
                  <CreditCard size={24} color="#006FCF" />
                  <Text style={[styles.paymentText, { color: theme.colors.text }]}>AMEX</Text>
                </View>
              </Card>
              <Card style={styles.paymentCard}>
                <View style={styles.paymentIcon}>
                  <CreditCard size={24} color="#003087" />
                  <Text style={[styles.paymentText, { color: theme.colors.text }]}>PayPal</Text>
                </View>
              </Card>
              <Card style={styles.paymentCard}>
                <View style={styles.paymentIcon}>
                  <CreditCard size={24} color="#1DB954" />
                  <Text style={[styles.paymentText, { color: theme.colors.text }]}>Apple Pay</Text>
                </View>
              </Card>
              <Card style={styles.paymentCard}>
                <View style={styles.paymentIcon}>
                  <CreditCard size={24} color="#4285F4" />
                  <Text style={[styles.paymentText, { color: theme.colors.text }]}>Google Pay</Text>
                </View>
              </Card>
            </View>
          </ScrollView>
        </Animated.View>

        {/* Product Information */}
        <Animated.View entering={FadeInDown.delay(1200).springify()} style={{ marginTop: 40 }}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, marginHorizontal: 20, marginBottom: 16 }]}>
            {t('aboutMaxTestorin')}
          </Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
            bounces={false}
            overScrollMode="never"
            decelerationRate="fast"
          >
            <View style={styles.horizontalContent}>
              <Card style={styles.infoCard}>
                <View style={styles.infoContent}>
                  <Zap size={28} color={theme.colors.primary} />
                  <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
                    {t('premiumFormula')}
                  </Text>
                  <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                    {t('premiumFormulaDescription')}
                  </Text>
                </View>
              </Card>
              
              <Card style={styles.infoCard}>
                <View style={styles.infoContent}>
                  <Zap size={28} color="#10B981" />
                  <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
                    {t('naturalIngredients')}
                  </Text>
                  <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                    {t('naturalIngredientFormula')}
                  </Text>
                </View>
              </Card>
              
              <Card style={styles.infoCard}>
                <View style={styles.infoContent}>
                  <Shield size={28} color="#8B5CF6" />
                  <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
                    {t('moneyBackGuaranteeTitle')}
                  </Text>
                  <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                    {t('moneyBackGuarantee')}
                  </Text>
                </View>
              </Card>
              
              <Card style={styles.infoCard}>
                <View style={styles.infoContent}>
                  <Truck size={28} color="#F59E0B" />
                  <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
                    {t('freeWorldwideShippingTitle')}
                  </Text>
                  <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                    {t('freeWorldwideShipping')}
                  </Text>
                </View>
              </Card>
              
              <Card style={styles.infoCard}>
                <View style={styles.infoContent}>
                  <Award size={28} color="#EF4444" />
                  <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
                    {t('qualityAssured')}
                  </Text>
                  <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                    {t('testedCertified')}
                  </Text>
                </View>
              </Card>
            </View>
          </ScrollView>
        </Animated.View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: '100%',
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  mainSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    marginBottom: 20,
  },
  productCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    minHeight: 280,
    justifyContent: 'space-between',
  },
  mainProductCard: {
    minHeight: 320,
    justifyContent: 'space-between',
    paddingVertical: 32,
  },
  badge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginHorizontal: 8,
  },
  productImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  bottlesImage: {
    width: 240,
    height: 120,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 28,
  },
  savingsText: {
    fontSize: 20,
    marginBottom: 8,
    color: '#F59E0B',
    textAlign: 'center',
    marginBottom: 12,
  },
  priceContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  priceText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
  },
  buyButton: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 16,
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 8,
  },
  buyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 20,
    flexWrap: 'wrap',
  },
  packagePrice: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
  },
  savingsSmall: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
  },
  horizontalScroll: {
    paddingLeft: 20,
    marginBottom: 20,
  },
  horizontalContent: {
    flexDirection: 'row',
    gap: 16,
    paddingRight: 20,
  },
  featureCard: {
    padding: 16,
    width: 100,
    alignItems: 'center',
  },
  featureItem: {
    alignItems: 'center',
    gap: 8,
  },
  featureIcon: {
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  paymentCard: {
    padding: 16,
    width: 100,
    alignItems: 'center',
  },
  paymentIcon: {
    alignItems: 'center',
    gap: 4,
  },
  paymentText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoCard: {
    padding: 24,
    width: 220,
    minHeight: 180,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  infoContent: {
    alignItems: 'center',
    gap: 12,
    flex: 1,
    justifyContent: 'center',
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    fontSize: 14,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 20,
  },
  otherPackages: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  packagesGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  packagesScroll: {
    paddingLeft: 0,
  },
  packagesScrollContent: {
    paddingHorizontal: 0,
    gap: 16,
  },
  swipeHint: {
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(220, 38, 38, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.1)',
  },
  swipeHintText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitleText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
});