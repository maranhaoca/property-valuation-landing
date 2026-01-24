import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'zipCodeFormat'
})
export class ZipCodeFormatPipe implements PipeTransform {
    transform(value: string): string {
        if (!value) return value;
        // Example: Format "1234567" as "1234-567"
        return value.replace(/(\d{4})(\d{3})/, '$1-$2');
    }
}
