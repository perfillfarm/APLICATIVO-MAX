import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Zap } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withDelay,
  withTiming
} from 'react-native-reanimated';

interface ChartData {
  date: string;
  capsules: number;
  day: string;
  completed: boolean;
}

interface BarChartProps {
  data: ChartData[];
  maxValue?: number;
}

const AnimatedBar: React.FC<{ 
  data: ChartData; 
  index: number; 
  maxCapsules: number 
}> = ({ data, index, maxCapsules }) => {
  const { theme } = useTheme();
  const barHeight = useSharedValue(0);
  const barOpacity = useSharedValue(0);

  React.useEffect(() => {
    const delay = index * 50;
    barHeight.value = withDelay(
      delay,
      withSpring(Math.max((data.capsules / maxCapsules) * 120, 4), {
        damping: 15,
        stiffness: 100,
      })
    );
    barOpacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
  }, [data.capsules, maxCapsules, index]);

  const barStyle = useAnimatedStyle(() => {
    return {
      height: barHeight.value,
      opacity: barOpacity.value,
    };
  });

  return (
    <View style={styles.barContainer}>
      <View style={styles.barWrapper}>
        {/* Valor acima da barra */}
        {data.capsules > 0 && (
          <Text style={[styles.barValue, { color: theme.colors.primary }]}>
            {data.capsules}
          </Text>
        )}
        
        {/* Indicador de sucesso */}
        {data.completed && (
          <View style={styles.completedIndicator}>
            <Zap size={10} color={theme.colors.success} />
          </View>
        )}
        
        {/* Barra vertical */}
        <Animated.View
          style={[
            styles.verticalBar,
            barStyle,
            {
              backgroundColor: data.completed ? theme.colors.primary : theme.colors.border,
            },
          ]}
        />
      </View>
    </View>
  );
};

export const BarChart: React.FC<BarChartProps> = ({ data, maxValue }) => {
  const { theme } = useTheme();
  
  // Garantir que sempre temos dados válidos
  const safeData = data || [];
  const maxCapsules = maxValue || Math.max(...safeData.map(d => d.capsules || 0), 2);

  return (
    <View style={styles.chart}>
      {/* Linhas de grade horizontais */}
      <View style={styles.gridLines}>
        {[0, 1, 2, 3].map((value) => (
          <View key={value} style={styles.gridLineContainer}>
            <Text style={[styles.gridLabel, { color: theme.colors.textSecondary }]}>
              {value}
            </Text>
            <View style={[styles.gridLine, { backgroundColor: theme.colors.border }]} />
          </View>
        ))}
      </View>
      
      {/* Barras do gráfico */}
      <View style={styles.chartBars}>
        {safeData.length > 0 ? (
          safeData.map((item, index) => (
            <AnimatedBar
              key={`${item.date}-${index}`}
              data={item}
              index={index}
              maxCapsules={maxCapsules}
            />
          ))
        ) : (
          <View style={styles.emptyChart}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Nenhum dado disponível
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chart: {
    height: 180,
    marginBottom: 16,
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 20,
    bottom: 20,
    justifyContent: 'space-between',
  },
  gridLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 1,
  },
  gridLabel: {
    fontSize: 10,
    fontWeight: '500',
    width: 20,
    textAlign: 'right',
    marginRight: 8,
  },
  gridLine: {
    flex: 1,
    height: 1,
    opacity: 0.3,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 1,
  },
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    position: 'relative',
  },
  verticalBar: {
    width: 12,
    borderRadius: 6,
    minHeight: 4,
  },
  barValue: {
    fontSize: 9,
    fontWeight: '600',
    marginBottom: 4,
    position: 'absolute',
    top: -18,
  },
  completedIndicator: {
    position: 'absolute',
    top: -30,
    backgroundColor: '#f0fdf4',
    borderRadius: 6,
    padding: 2,
  },
  emptyChart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});