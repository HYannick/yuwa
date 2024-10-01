import {useRoute, useRouter} from 'vue-router';

export const useSidebarHistoryState = () => {
  const router = useRouter()
  const route = useRoute()
  const pushTo = async (currentSidebar) => {
    await router.push({path: route.path, query: {[currentSidebar]: 'open'}});
  }
  const resetRoute = async (currentSidebar) => {
    let newQuery = {...route.query};
    delete newQuery[currentSidebar];
    await router.replace({path: route.path, query: newQuery});
  }

  const onBackButtonPressed = async (sidebarOpen: boolean, cb: () => void) => {
    if (sidebarOpen) {
      cb();
    } else {
      if (window.history.length <= 1) {
        await router.push('/');
      }
    }
  }

  return {pushTo, resetRoute, onBackButtonPressed}
}