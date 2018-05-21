import { MGTemplate } from './mg-def'
import { MGBuilder } from './mg-eval';


MGBuilder.build('kobold', 'mook').then(console.log).catch(console.warn)

