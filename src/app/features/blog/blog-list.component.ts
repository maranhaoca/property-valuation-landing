import { Component } from '@angular/core';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  template: `
    <section class="w-full py-8 px-6 bg-gray-50">
      <h2 class="text-2xl font-bold text-primary mb-4">Blog</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <article class="bg-white shadow rounded overflow-hidden">
          <h3 class="text-lg font-semibold text-primary">Post 1</h3>
          <p class="text-sm text-gray-600">Resumo do post...</p>
          <a href="#" class="text-sm text-primary hover:underline">Leia mais</a>
        </article>
      </div>
    </section>
  `,
  styles: []
})
export class BlogListComponent {}
