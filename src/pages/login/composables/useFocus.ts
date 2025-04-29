/** Focus Composable */
export function useFocus() {
  // whether the element is focused
  const isFocus = ref<boolean>(false)

  // handle blur (lose focus)
  const handleBlur = () => {
    isFocus.value = false
  }

  // handle focus (gain focus)
  const handleFocus = () => {
    isFocus.value = true
  }

  return { isFocus, handleBlur, handleFocus }
}
