from typing_extensions import override
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.request import Request
from ..models import Task, CompletedTask
from django.shortcuts import get_object_or_404
from ..serializers import CompletedTaskSerializer
from rest_framework.authentication import BasicAuthentication


class TaskHistory(ListAPIView):
    authentication_classes = [BasicAuthentication]
    serializer_class = CompletedTaskSerializer
    queryset = CompletedTask.objects.all()


class TaskHistoryDetail(ListAPIView):
    authentication_classes = [BasicAuthentication]

    @override
    def list(self, request: Request, *args, **kwargs) -> Response:
        task = get_object_or_404(Task, pk=kwargs["pk"])
        completed_tasks = task.completedtask_set.all()
        return Response(CompletedTaskSerializer(completed_tasks, many=True).data)

