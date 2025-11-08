from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from .views.tasks import TaskList, TaskDetail
from .views.task_history import TaskHistory, TaskHistoryDetail

urlpatterns = [
    path("tasks/", TaskList.as_view()),
    path("tasks/<int:pk>", TaskDetail.as_view()),
    path("tasks/history", TaskHistory.as_view()),
    path("tasks/<int:pk>/history", TaskHistoryDetail.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns)
