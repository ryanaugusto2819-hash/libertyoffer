# DR Control
- [x] Phase 1: secure access, profiles and team invitations implemented.
- [x] Phase 1: dark/light layout and module navigation verified.
- [x] Phase 1: offer creation, editing and archiving implemented.
- [x] Phase 1: individual/batch demands, independent assignees and progress implemented.
- [x] Phase 1: private reference/final file uploads and previews implemented.
- [x] Verify administrator persistence end to end — created temporary offer, SPY video reference, demand, final version, approval, publication and financial results through the UI; financial rows survived reload. Removed temporary records and media.
- [x] Initial administrator account — provisioned through trusted tooling and invitation sent; owner must accept the invitation and define a password.

- [x] Complete the app: reduce repeated loading and verify authenticated creation and private uploads. Scoped refreshes avoid global reloads.
- [x] Complete the app: implement Central de SPY with persisted references and permission enforcement.
- [x] Complete the app: implement creative library, production, version approvals and independent publication.
- [x] Complete the app: implement financial records and currency-safe performance metrics.
- [x] Complete the app: implement operational notifications and finish account settings.
- [x] Complete the app: verify administrator workflow, financial rules, notifications, saved appearance and desktop/mobile pages; removed next-phase placeholders.
- [ ] Execute the committed editor/SPY/traffic permission transaction suite — blocked: available database connection has no trusted role-table write access. Administrator flow and RLS review completed; separate-role execution is not verified.
- [ ] Verify invitation acceptance and password change with the owner — blocked: browser session does not establish ownership of the invitation email or the owner’s intended password; no password was changed during testing.