<template>
  <div :class="$style.langSwitcher">
    <select :value="locale" @change="handleChange">
      <option v-for="loc in locales" :key="loc.code" :value="loc.code">
        {{ loc.flag }} {{ loc.name }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
const { locale, setLocale } = useI18n()

const locales = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
] as const

type LocaleCode = typeof locales[number]['code']

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  setLocale(target.value as LocaleCode)
}
</script>

<style module>
.langSwitcher {
  /* position relative allows it to flow naturally in the footer flexbox */
}

.langSwitcher select {
  appearance: none;
  background: var(--color-glass);
  backdrop-filter: var(--blur-surface);
  border: 1px solid var(--color-glass-border);
  color: var(--color-text);
  padding: 0.5rem 2rem 0.5rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23f1f5f9' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
}

.langSwitcher select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.langSwitcher select option {
  background-color: var(--color-bg);
  color: var(--color-text);
}


</style>
