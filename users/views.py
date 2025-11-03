from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from django.contrib.auth.models import User
from .serializers import UserSerializer
from django.shortcuts import get_object_or_404


# Create your views here.
class UserList(APIView):
    def get(self, _: Request) -> Response:
        return Response(UserSerializer(User.objects.all(), many=True).data)


class UserDetail(APIView):
    def get(self, _: Request, pk: int) -> Response:
        return Response(UserSerializer(get_object_or_404(User, pk=pk)).data)
