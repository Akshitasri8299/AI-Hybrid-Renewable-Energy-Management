from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = "Creates three role-based login accounts: admin, operator, and viewer"

    def handle(self, *args, **options):
        accounts = [
            {
                "username": "admin",
                "email": "admin@hybridenergy.local",
                "password": "admin123",
                "is_superuser": True,
                "is_staff": True,
            },
            {
                "username": "operator",
                "email": "operator@hybridenergy.local",
                "password": "operator123",
                "is_superuser": False,
                "is_staff": True,
            },
            {
                "username": "viewer",
                "email": "viewer@hybridenergy.local",
                "password": "viewer123",
                "is_superuser": False,
                "is_staff": False,
            },
        ]

        for acct in accounts:
            user, created = User.objects.get_or_create(
                username=acct["username"],
                defaults={
                    "email": acct["email"],
                    "is_superuser": acct["is_superuser"],
                    "is_staff": acct["is_staff"],
                },
            )
            if created:
                user.set_password(acct["password"])
                user.save()
                self.stdout.write(self.style.SUCCESS(
                    f"Created user '{acct['username']}' (role: {self._role(acct)})"
                ))
            else:
                user.email = acct["email"]
                user.is_superuser = acct["is_superuser"]
                user.is_staff = acct["is_staff"]
                user.set_password(acct["password"])
                user.save()
                self.stdout.write(self.style.WARNING(
                    f"Updated existing user '{acct['username']}' (role: {self._role(acct)})"
                ))

        self.stdout.write(self.style.SUCCESS("\n=== Login Credentials ==="))
        self.stdout.write("  Admin    | username: admin    | password: admin123    | role: admin")
        self.stdout.write("  Operator | username: operator | password: operator123 | role: staff")
        self.stdout.write("  Viewer   | username: viewer   | password: viewer123   | role: user")

    def _role(self, acct):
        if acct["is_superuser"]:
            return "admin"
        if acct["is_staff"]:
            return "staff"
        return "user"
