from rest_framework import serializers
from .models import Task, CompletedTask
from django.utils import timezone


class CompletedTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompletedTask
        fields = ["id", "completed_at"]
        read_only_fields = ["id", "completed_at"]


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
