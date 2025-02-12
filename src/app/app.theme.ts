import { $dt, definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

export const BeaverTheme = definePreset(Aura, {
    semantic: {
        primary: {
            /*50: '#e1ecfa',
            100: '#c8ddfa',
            200: '#afcefa',
            300: '#7daffa',*/
            50: '#2443e010',
            100: '#2443e020',
            200: '#2443e030',
            300: '#2443e050',
            400: '#4983f5',
            500: '#3060f0',
            600: '#2443e0',
            700: '#1b33d1',
            800: '#1a2799',
            900: '#191f73',
            950: '#171954'
        },
        colorScheme: {
            light: {
                surface: {
                    0: '#efefef',
                    50: '{neutral.50}',
                    100: '{neutral.100}',
                    200: '{neutral.200}',
                    300: '{neutral.300}',
                    400: '{neutral.400}',
                    500: '{neutral.500}',
                    600: '{neutral.600}',
                    700: '{neutral.700}',
                    800: '{neutral.800}',
                    900: '{neutral.900}',
                    950: '{neutral.950}'
                }
            },
            dark: {
                surface: {
                    0: '#efefef',
                    50: '{zinc.50}',
                    100: '{zinc.100}',
                    200: '{zinc.200}',
                    300: '{zinc.300}',
                    400: '{zinc.400}',
                    500: '{zinc.500}',
                    600: '{zinc.600}',
                    700: '{zinc.700}',
                    800: '{zinc.800}',
                    900: '{zinc.900}',
                    950: '{zinc.950}'
                }
            }
        }
    },
    extends: {
        b: {
            overlay: {
                240: '#4983f52f',
                250: '#3060f02f',
                260: '#2443e02f',
                270: '#1b33d12f',
                280: '#1a27992f',
                440: '#4983f54f',
                450: '#3060f04f',
                460: '#2443e04f',
                470: '#1b33d14f',
                480: '#1a27994f',
                640: '#4983f56f',
                650: '#3060f06f',
                660: '#2443e06f',
                670: '#1b33d16f',
                680: '#1a27996f',
                840: '#4983f58f',
                850: '#3060f08f',
                860: '#2443e08f',
                870: '#1b33d18f',
                880: '#1a27998f',
            }
        }
    },
    components: {
        button: {
            paddingX: '0.5rem',
            paddingY: '0.25rem',
            borderRadius: '0.75rem',
            primaryBorderColor: 'var(--p-primary-600)',
            primaryBackground: 'var(--p-primary-700)',
            textPrimaryColor: 'var(--p-surface-300)'
        },
        card: {
            background: 'var(--p-surface-800)',
            borderRadius: '1rem',
            bodyPadding: '0.25rem'
        },
        panel: {
            header: {
                padding: '0.5rem 0.75rem 0.75rem 0.75rem'
            },
            background: 'var(--p-primary-100)',
            borderColor: 'var(--p-primary-600)',
            borderRadius: '0.75rem'
        },
        tabs: {
            tabPadding: '0 0 0.25rem 0',
            tabpanelPadding: '0.5rem',
            tablistBackground: 'transparent',
            tabActiveBackground: 'var(--p-content-background)'
        },
        splitter: {
            gutterBackground: 'transparent',
            background: 'transparent',
            borderColor: 'transparent'
        },
        menubar: {
            padding: '0 0.2rem',
            borderColor: 'transparent',
            background: 'var(--p-surface-950)',
            borderRadius: '0.5rem',
            baseItemPadding: '0.25rem 0.3rem',
            gap: '0',
            itemGap: '0.3rem',
            itemPadding: '0.25rem 0.5rem'
        },
        inputtext: {
            paddingY: '0.25rem'
        },
        tooltip: {
            padding: '0.15rem 0.5rem'
        },
        select: {
            optionPadding: '0.15rem 0.5rem'
        },
        tree: {
            background: 'transparent',
            padding: '0',
            node: {
                padding: '0.1rem 0',
                toggleButtonSize: '1.25rem'
            },
            nodeToggleButtonSize: '1.25rem'
        },
        progressbar: {
            labelColor: 'var(--p-surface-0)'
        }
    }
})