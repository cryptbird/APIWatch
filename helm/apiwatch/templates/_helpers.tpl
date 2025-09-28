{{/*
Expand the name of the chart.
*/}}
{{- define "apiwatch.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "apiwatch.fullname" -}}
{{- default .Chart.Name .Release.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "apiwatch.labels" -}}
app.kubernetes.io/name: {{ include "apiwatch.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "apiwatch.selectorLabels" -}}
app.kubernetes.io/name: {{ include "apiwatch.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
