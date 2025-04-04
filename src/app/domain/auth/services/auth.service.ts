import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

import { iUser } from '../interfaces/user.interface';
import { injectSupabase } from './../../../shared/functions/inject-supabase.function';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly supabase = injectSupabase();
  private readonly router = inject(Router);

  public currentUser = signal<iUser | null>(null);
  public isLoggedIn = signal<boolean>(false);

  public async load() {
    const { data } = await this.supabase.auth.getSession();
    if (!data.session) {
      return;
    }

    this.currentUser.set(data.session.user as unknown as iUser);
    this.isLoggedIn.set(true);
  }

  public async purgeAndRedirect() {
    await this.supabase.auth.signOut();
    this.router.navigate(['/auth']);
  }

  public async updateUser(data: Partial<iUser>, id?: string) {
    const { data: user, error } = await this.supabase
      .from('users')
      .update(data)
      .match({ id: id || this.currentUser()?.id })
      .select('*')
      .maybeSingle();

    if (error) throw error;
    this.currentUser.set(user as iUser);
  }
}
