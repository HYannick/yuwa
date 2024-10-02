import { computed, ref } from "vue";

export type Theme = "dark" | "light";
export const useTheme = () => {
  const currentTheme = ref<Theme>(
    (localStorage.getItem("theme") as Theme) || "light"
  );
  const switchTheme = () => {
    if (currentTheme.value === "light") {
      document.documentElement.className = "dark";
      currentTheme.value = "dark";
    } else {
      document.documentElement.className = "light";
      currentTheme.value = "light";
    }
    localStorage.setItem("theme", currentTheme.value);
  };
  const themeLabel = computed(() =>
    currentTheme.value === "dark" ? "moon" : "sun"
  );

  const isDarkMode = computed(() => {
    return currentTheme.value === "dark";
  });

  const setTheme = () => {
    const theme = (localStorage.getItem("theme") as Theme) || "light";
    document.documentElement.className = theme;
    currentTheme.value = theme;
  };

  return {
    currentTheme,
    themeLabel,
    switchTheme,
    setTheme,
    isDarkMode,
  };
};
