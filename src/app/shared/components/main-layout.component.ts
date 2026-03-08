import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule],
  template: `
    <header class="w-full py-4 px-6 bg-white shadow flex items-center justify-between">
      <span class="font-bold text-xl text-primary">Paguro</span>
      <nav>
        <ul class="flex space-x-4">
          <li><a routerLink="" class="text-sm text-gray-600 hover:text-primary">Início</a></li>
          <li><a routerLink="blog" class="text-sm text-gray-600 hover:text-primary">Blog</a></li>
          <li><a routerLink="privacidade" class="text-sm text-gray-600 hover:text-primary">Política de Privacidade</a></li>
        </ul>
      </nav>
    </header>
    <main class="flex-1">
      <router-outlet></router-outlet>
    </main>
    <footer class="w-full py-6 px-6 bg-primary text-white mt-8">
      <div class="flex justify-between items-center">
        <span class="text-sm">&copy; 2026 Paguro. Todos os direitos reservados.</span>
      </div>
    </footer>
  `,
  styles: []
})
export class MainLayoutComponent {}
