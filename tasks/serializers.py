from rest_framework import serializers
from .models import Task, CompletedTask
from django.utils import timezone


class CompletedTaskSerializer(serializers.ModelSerializer):
    task_id = serializers.IntegerField(source="task.id", read_only=True)
    task_title = serializers.CharField(source="task.title", read_only=True)
    task_description = serializers.CharField(source="task.description", read_only=True)

    class Meta:
        model = CompletedTask
        fields = ["id", "completed_at", "task_id", "task_title", "task_description"]
        read_only_fields = ["id", "completed_at", "task_id", "task_title", "task_description"]


class TaskSerializer(serializers.ModelSerializer):
    completed_today = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "created_at",
            "type",
            "completed_today",
        ]
        read_only_fields = ["id", "created_at", "completed_today"]

    def get_completed_today(self, obj):
        return CompletedTask.objects.filter(
            task=obj, 
            completed_at__date=timezone.now().date()
        ).exists()
