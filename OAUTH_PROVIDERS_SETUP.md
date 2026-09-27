# SB1 OAuth providers
SB1 registration now presents Google, Facebook, LinkedIn, Yandex, VK.ru and OK.ru after the electronic contract step.

Built-in Supabase providers:
- Google: `google`
- Facebook: `facebook`
- LinkedIn OIDC: `linkedin_oidc`

Custom providers for the Russian-region services:
- Yandex: `custom:yandex`
- VK.ru: `custom:vk`
- OK.ru: `custom:okru`

The custom identifiers must be created/enabled in Supabase Auth before production login will redirect to those providers. Supabase supports standards-compliant custom OAuth2/OIDC providers using the `custom:` prefix.

The registration flow is:
1. Select account type.
2. Mandatory electronic contracts and declarations.
3. Check every required consent and enter the electronic signature.
4. Choose email/password or an OAuth provider.
5. Return to SB1 and complete any missing registration data.
6. Save the registration and update the admin registration directory.

Do not place client secrets in Vite/browser environment variables. OAuth client secrets belong in Supabase Auth provider configuration.
