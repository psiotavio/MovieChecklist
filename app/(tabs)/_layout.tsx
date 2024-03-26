import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useUser } from '../../contexts/UserContext';
import Colors from '../../constants/Colors';
import { useTheme } from '../../constants/temas/ThemeContext';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { movies, addMovieReview } = useUser();
  const { theme } = useTheme();
  const colorScheme = 'light';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint, // Aqui você pode querer usar o tema também
        tabBarInactiveTintColor: theme.text, // Usa a cor do texto do tema para ícones inativos
        tabBarStyle: { backgroundColor: theme.background }, // Define o fundo da tabBar com base no tema
        headerShown: false, 
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
        <Tabs.Screen
          name="three"
          options={{
            title: 'Recomendações',
            tabBarIcon: ({ color }) => <TabBarIcon name="film" color={color} />,
          }}
        />
        <Tabs.Screen
          name="four"
          options={{
            title: 'Listas',
            tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
          }}
        />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
