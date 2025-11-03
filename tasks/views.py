from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from .models import Task, CompletedTask
from django.shortcuts import get_object_or_404
from .serializers import TaskSerializer
from rest_framework.authentication import BasicAuthentication
from rest_framework import status
from django.utils import timezone


# Create your views here.
class TaskList(APIView):
    authentication_classes = [BasicAuthentication]

    def get(self, _: Request) -> Response:
        return Response(TaskSerializer(Task.objects.all(), many=True).data)

    def post(self, request: Request) -> Response:
        task_serializer = TaskSerializer(data=request.data)
        if not task_serializer.is_valid():
            return Response(task_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        task_serializer.save()
        return Response(TaskSerializer(Task.objects.all(), many=True).data)


class TaskDetail(APIView):
    authentication_classes = [BasicAuthentication]

    def get(self, _: Request, pk: int) -> Response:
        return Response(TaskSerializer(get_object_or_404(Task, pk=pk)).data)

    def put(self, request: Request, pk: int) -> Response:
        task = get_object_or_404(Task, pk=pk)

        # update task completion
        # TODO, only works for daily currently
        if "completed" in request.data:
            completed_task = CompletedTask.objects.filter(task=task, completed_at__date=timezone.now().date()).first()
            if not completed_task and request.data["completed"] is True:
                CompletedTask.objects.create(task=task)
            elif completed_task and request.data["completed"] is False:
                completed_task.delete()
            return Response(TaskSerializer(task).data)

        # update task itself
        task_serializer = TaskSerializer(task, data=request.data)
        if not task_serializer.is_valid():
            return Response(task_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        task_serializer.save()
        return Response(TaskSerializer(task_serializer.instance).data)

    def delete(self, _: Request, pk: int) -> Response:
        task = get_object_or_404(Task, pk=pk)
        task.delete()
        return Response(TaskSerializer(Task.objects.all(), many=True).data)
