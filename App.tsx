import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";
import {
  Dimensions,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { colors, links, routes } from "./utils";
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import MaskedView from "@react-native-masked-view/masked-view";

import Svg, { Polygon } from "react-native-svg";

const { width, height } = Dimensions.get("screen");

const fromCoords = { x: 0, y: height };
const toCoords = { x: width, y: 0 };

const AnimatedAntDesign = Animated.createAnimatedComponent(AntDesign);
const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

const Button = ({
  label,
  onPress,
  style,
}: {
  onPress: VoidFunction;
  label: string;
  style: StyleProp<TextStyle>;
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text style={style}>{label}</Text>
    </TouchableOpacity>
  );
};

const CustomDrawer = ({
  onPress,
  position,
}: {
  onPress: VoidFunction;
  position: SharedValue<{
    x: number;
    y: number;
  }>;
}) => {
  const animatedProps = useAnimatedProps(() => {
    return {
      points: `0,0 ${position.value.x},${position.value.y} ${width},${height} 0,${height}`,
    };
  }, []);
  return (
    <MaskedView
      style={{ flex: 1 }}
      maskElement={
        <Svg
          height={height}
          style={{ backgroundColor: "transparent" }}
          width={width}
          viewBox={`0 0 ${width} ${height}`}
        >
          <AnimatedPolygon fill={"green"} animatedProps={animatedProps} />
        </Svg>
      }
    >
      <View style={styles.menuContainer}>
        <AntDesign
          name="close"
          size={34}
          color="white"
          onPress={onPress}
          style={{
            position: "absolute",
            top: 40,
            right: 20,
          }}
        />
        <View style={styles.menu}>
          <View>
            {routes.map((route, index) => {
              return (
                <Button
                  label={route}
                  key={route}
                  onPress={onPress}
                  style={[styles.button, { color: colors[index] }]}
                />
              );
            })}
          </View>
          <View>
            {links.map((link, index) => {
              return (
                <Button
                  label={link}
                  key={link}
                  onPress={onPress}
                  style={[
                    styles.buttonSmall,
                    { color: colors[index + routes.length + 1] },
                  ]}
                />
              );
            })}
          </View>
        </View>
      </View>
    </MaskedView>
  );
};

export default function App() {
  const position = useSharedValue(fromCoords);
  const onCloseDrawer = useCallback(() => {
    position.value = withSpring(fromCoords, { damping: 80, stiffness: 200 });
  }, []);
  const onOpenDrawer = useCallback(() => {
    position.value = withSpring(toCoords, { damping: 80, stiffness: 200 });
  }, []);

  const y = useDerivedValue(() => position.value.y);
  const stylez = useAnimatedStyle(() => {
    return {
      position: "absolute",
      top: 40,
      right: 20,
      opacity: interpolate(position.value.y, [0, height], [0, 1]),
      transform: [{ translateX: interpolate(position.value.y, [0, height], [60, 0]) }],
    };
  });

  return (
    <View style={styles.container}>
      <CustomDrawer onPress={onCloseDrawer} position={position} />
      <AnimatedAntDesign
        name="menufold"
        size={34}
        color="#222"
        onPress={onOpenDrawer}
        style={stylez}
      />

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuContainer: {
    flex: 1,
    backgroundColor: "#222",
    alignItems: "flex-start",
    paddingTop: 80,
    paddingBottom: 30,
    paddingLeft: 30,
  },
  menu: {
    flex: 1,
    justifyContent: "space-between",
  },
  button: {
    fontSize: 34,
    lineHeight: 34 * 1.5,
  },
  buttonSmall: {
    fontSize: 16,
    lineHeight: 16 * 1.5,
  },
});
