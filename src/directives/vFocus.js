// Кастомная директива v-focus.
// mounted вызывается один раз — когда элемент появился в DOM.
// el — это сам DOM-элемент, на котором стоит директива.
export const vFocus = {
  mounted: (el) => el.focus()
}
