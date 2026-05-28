"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  FolderOpen,
  ImageIcon,
  Layers,
  Map,
  Palette,
  Plus,
  Tag,
  Trash2,
  Video,
} from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { LoadingState } from "@/components/dashboard/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, jsonBody } from "@/lib/api";
import { cn } from "@/lib/utils";
import { playNotificationBeep } from "@/lib/sound";
import { useNotificationStore } from "@/stores/notification-store";
import type { ContentType, Graphic, Note, Photo, Roadmap, Section, Video as VideoItem } from "@/types/api";

const tabs = [
  { id: "sections", label: "Sections", icon: FolderOpen },
  { id: "types", label: "Types", icon: Tag },
  { id: "roadmaps", label: "Roadmaps", icon: Map },
  { id: "notes", label: "Notes", icon: BookOpen },
  { id: "photos", label: "Photos", icon: ImageIcon },
  { id: "videos", label: "Videos", icon: Video },
  { id: "graphics", label: "Graphics", icon: Palette },
] as const;

type TabId = (typeof tabs)[number]["id"];

function SectionPicker({
  sections,
  value,
  onChange,
}: {
  sections: Section[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <select className="h-10 rounded-md border bg-background px-3 text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">No section</option>
      {sections.map((section) => (
        <option key={section.id} value={section.id}>
          {section.name}
        </option>
      ))}
    </select>
  );
}

function TypePicker({
  types,
  value,
  onChange,
}: {
  types: ContentType[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <select className="h-10 rounded-md border bg-background px-3 text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">No type</option>
      {types.map((type) => (
        <option key={type.id} value={type.id}>
          {type.name}
        </option>
      ))}
    </select>
  );
}

export default function WorkspacePage() {
  const queryClient = useQueryClient();
  const notify = useNotificationStore((s) => s.notify);
  const soundEnabled = useNotificationStore((s) => s.soundEnabled);
  const [activeTab, setActiveTab] = useState<TabId>("sections");

  const sectionsQuery = useQuery({ queryKey: ["sections"], queryFn: () => apiRequest<Section[]>("/workspace/sections") });
  const typesQuery = useQuery({ queryKey: ["content-types"], queryFn: () => apiRequest<ContentType[]>("/workspace/content-types") });
  const roadmapsQuery = useQuery({ queryKey: ["roadmaps"], queryFn: () => apiRequest<Roadmap[]>("/workspace/roadmaps") });
  const notesQuery = useQuery({ queryKey: ["notes"], queryFn: () => apiRequest<Note[]>("/workspace/notes") });
  const photosQuery = useQuery({ queryKey: ["photos"], queryFn: () => apiRequest<Photo[]>("/workspace/photos") });
  const videosQuery = useQuery({ queryKey: ["videos"], queryFn: () => apiRequest<VideoItem[]>("/workspace/videos") });
  const graphicsQuery = useQuery({ queryKey: ["graphics"], queryFn: () => apiRequest<Graphic[]>("/workspace/graphics") });

  const sections = sectionsQuery.data ?? [];
  const types = typesQuery.data ?? [];

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["sections"] });
    void queryClient.invalidateQueries({ queryKey: ["content-types"] });
    void queryClient.invalidateQueries({ queryKey: ["roadmaps"] });
    void queryClient.invalidateQueries({ queryKey: ["notes"] });
    void queryClient.invalidateQueries({ queryKey: ["photos"] });
    void queryClient.invalidateQueries({ queryKey: ["videos"] });
    void queryClient.invalidateQueries({ queryKey: ["graphics"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const [sectionForm, setSectionForm] = useState({ name: "", description: "", color: "#6366f1" });
  const [typeForm, setTypeForm] = useState({ name: "", color: "#8b5cf6" });
  const [roadmapForm, setRoadmapForm] = useState({ title: "", description: "", milestones: "", sectionId: "", typeId: "" });
  const [noteForm, setNoteForm] = useState({ title: "", content: "", sectionId: "", typeId: "" });
  const [photoForm, setPhotoForm] = useState({ title: "", url: "", caption: "", sectionId: "", typeId: "" });
  const [videoForm, setVideoForm] = useState({ title: "", url: "", caption: "", sectionId: "", typeId: "" });
  const [graphicForm, setGraphicForm] = useState({ title: "", url: "", kind: "OTHER", description: "", sectionId: "", typeId: "" });

  const createSection = useMutation({
    mutationFn: () =>
      apiRequest("/workspace/sections", {
        method: "POST",
        body: jsonBody({ name: sectionForm.name, description: sectionForm.description || undefined, color: sectionForm.color }),
      }),
    onSuccess: () => {
      setSectionForm({ name: "", description: "", color: "#6366f1" });
      invalidate();
      notify({ title: "Saved", message: `Section "${sectionForm.name}" created.`, variant: "success" });
      if (soundEnabled) playNotificationBeep();
    },
  });

  const deleteSection = useMutation({
    mutationFn: (id: string) => apiRequest(`/workspace/sections/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      invalidate();
      notify({ title: "Removed", message: "Section deleted.", variant: "destructive" });
      if (soundEnabled) playNotificationBeep();
    },
  });

  const createType = useMutation({
    mutationFn: () => apiRequest("/workspace/content-types", { method: "POST", body: jsonBody({ name: typeForm.name, color: typeForm.color }) }),
    onSuccess: () => {
      setTypeForm({ name: "", color: "#8b5cf6" });
      invalidate();
      notify({ title: "Saved", message: `Type "${typeForm.name}" created.`, variant: "success" });
      if (soundEnabled) playNotificationBeep();
    },
  });

  const deleteType = useMutation({
    mutationFn: (id: string) => apiRequest(`/workspace/content-types/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      invalidate();
      notify({ title: "Removed", message: "Type deleted.", variant: "destructive" });
      if (soundEnabled) playNotificationBeep();
    },
  });

  const createRoadmap = useMutation({
    mutationFn: () =>
      apiRequest("/workspace/roadmaps", {
        method: "POST",
        body: jsonBody({
          title: roadmapForm.title,
          description: roadmapForm.description || undefined,
          sectionId: roadmapForm.sectionId || undefined,
          typeId: roadmapForm.typeId || undefined,
          milestones: roadmapForm.milestones
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .map((title) => ({ title })),
        }),
      }),
    onSuccess: () => {
      setRoadmapForm({ title: "", description: "", milestones: "", sectionId: "", typeId: "" });
      invalidate();
      notify({ title: "Saved", message: `Roadmap "${roadmapForm.title}" created.`, variant: "success" });
      if (soundEnabled) playNotificationBeep();
    },
  });

  const deleteRoadmap = useMutation({
    mutationFn: (id: string) => apiRequest(`/workspace/roadmaps/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      invalidate();
      notify({ title: "Removed", message: "Roadmap deleted.", variant: "destructive" });
      if (soundEnabled) playNotificationBeep();
    },
  });

  const createNote = useMutation({
    mutationFn: () =>
      apiRequest("/workspace/notes", {
        method: "POST",
        body: jsonBody({
          title: noteForm.title,
          content: noteForm.content,
          sectionId: noteForm.sectionId || undefined,
          typeId: noteForm.typeId || undefined,
        }),
      }),
    onSuccess: () => {
      setNoteForm({ title: "", content: "", sectionId: "", typeId: "" });
      invalidate();
      notify({ title: "Saved", message: `Note "${noteForm.title}" created.`, variant: "success" });
      if (soundEnabled) playNotificationBeep();
    },
  });

  const deleteNote = useMutation({
    mutationFn: (id: string) => apiRequest(`/workspace/notes/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      invalidate();
      notify({ title: "Removed", message: "Note deleted.", variant: "destructive" });
      if (soundEnabled) playNotificationBeep();
    },
  });

  const createPhoto = useMutation({
    mutationFn: () =>
      apiRequest("/workspace/photos", {
        method: "POST",
        body: jsonBody({
          title: photoForm.title,
          url: photoForm.url,
          caption: photoForm.caption || undefined,
          sectionId: photoForm.sectionId || undefined,
          typeId: photoForm.typeId || undefined,
        }),
      }),
    onSuccess: () => {
      setPhotoForm({ title: "", url: "", caption: "", sectionId: "", typeId: "" });
      invalidate();
      notify({ title: "Saved", message: `Photo "${photoForm.title}" added.`, variant: "success" });
      if (soundEnabled) playNotificationBeep();
    },
  });

  const deletePhoto = useMutation({
    mutationFn: (id: string) => apiRequest(`/workspace/photos/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      invalidate();
      notify({ title: "Removed", message: "Photo deleted.", variant: "destructive" });
      if (soundEnabled) playNotificationBeep();
    },
  });

  const createVideo = useMutation({
    mutationFn: () =>
      apiRequest("/workspace/videos", {
        method: "POST",
        body: jsonBody({
          title: videoForm.title,
          url: videoForm.url,
          caption: videoForm.caption || undefined,
          sectionId: videoForm.sectionId || undefined,
          typeId: videoForm.typeId || undefined,
        }),
      }),
    onSuccess: () => {
      setVideoForm({ title: "", url: "", caption: "", sectionId: "", typeId: "" });
      invalidate();
      notify({ title: "Saved", message: `Video "${videoForm.title}" added.`, variant: "success" });
      if (soundEnabled) playNotificationBeep();
    },
  });

  const deleteVideo = useMutation({
    mutationFn: (id: string) => apiRequest(`/workspace/videos/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      invalidate();
      notify({ title: "Removed", message: "Video deleted.", variant: "destructive" });
      if (soundEnabled) playNotificationBeep();
    },
  });

  const createGraphic = useMutation({
    mutationFn: () =>
      apiRequest("/workspace/graphics", {
        method: "POST",
        body: jsonBody({
          title: graphicForm.title,
          url: graphicForm.url,
          kind: graphicForm.kind,
          description: graphicForm.description || undefined,
          sectionId: graphicForm.sectionId || undefined,
          typeId: graphicForm.typeId || undefined,
        }),
      }),
    onSuccess: () => {
      setGraphicForm({ title: "", url: "", kind: "OTHER", description: "", sectionId: "", typeId: "" });
      invalidate();
      notify({ title: "Saved", message: `Graphic "${graphicForm.title}" added.`, variant: "success" });
      if (soundEnabled) playNotificationBeep();
    },
  });

  const deleteGraphic = useMutation({
    mutationFn: (id: string) => apiRequest(`/workspace/graphics/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      invalidate();
      notify({ title: "Removed", message: "Graphic deleted.", variant: "destructive" });
      if (soundEnabled) playNotificationBeep();
    },
  });

  const isLoading = [sectionsQuery, typesQuery, roadmapsQuery, notesQuery, photosQuery, videosQuery, graphicsQuery].some((q) => q.isLoading);

  return (
    <div className="space-y-6">
      <PageHeader title="Workspace" description="Organize sections, roadmaps, notes, photos, videos, and graphics. All searchable by AI." />

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button key={tab.id} variant={activeTab === tab.id ? "default" : "outline"} size="sm" onClick={() => setActiveTab(tab.id)}>
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {isLoading ? <LoadingState /> : null}

      {activeTab === "sections" && (
        <div className="space-y-4">
          <form
            className="grid gap-3 rounded-lg border bg-card p-4 lg:grid-cols-[1fr_120px_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              createSection.mutate();
            }}
          >
            <Input placeholder="Section name" value={sectionForm.name} onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })} required />
            <Input type="color" value={sectionForm.color} onChange={(e) => setSectionForm({ ...sectionForm, color: e.target.value })} />
            <Button disabled={createSection.isPending}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
            <Textarea className="lg:col-span-3" placeholder="Description" value={sectionForm.description} onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })} />
          </form>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sections.map((section) => (
              <div key={section.id} className="rounded-lg border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: section.color }} />
                    <h2 className="font-semibold">{section.name}</h2>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteSection.mutate(section.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {section.description ? <p className="mt-2 text-sm text-muted-foreground">{section.description}</p> : null}
              </div>
            ))}
          </div>
          {!sections.length && sectionsQuery.isSuccess ? <EmptyState icon={FolderOpen} title="No sections" description="Create sections to group your content." /> : null}
        </div>
      )}

      {activeTab === "types" && (
        <div className="space-y-4">
          <form
            className="flex flex-wrap gap-3 rounded-lg border bg-card p-4"
            onSubmit={(e) => {
              e.preventDefault();
              createType.mutate();
            }}
          >
            <Input className="min-w-[200px] flex-1" placeholder="Type name" value={typeForm.name} onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })} required />
            <Input type="color" className="w-20" value={typeForm.color} onChange={(e) => setTypeForm({ ...typeForm, color: e.target.value })} />
            <Button disabled={createType.isPending}>
              <Plus className="h-4 w-4" />
              Add type
            </Button>
          </form>
          <div className="flex flex-wrap gap-2">
            {types.map((type) => (
              <Badge key={type.id} variant="outline" className="gap-2 px-3 py-2 text-sm">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: type.color ?? "#6366f1" }} />
                {type.name}
                <button type="button" className="ml-1 text-muted-foreground hover:text-destructive" onClick={() => deleteType.mutate(type.id)}>
                  ×
                </button>
              </Badge>
            ))}
          </div>
          {!types.length && typesQuery.isSuccess ? <EmptyState icon={Tag} title="No types" description="Define custom types to label content." /> : null}
        </div>
      )}

      {activeTab === "roadmaps" && (
        <div className="space-y-4">
          <form
            className="grid gap-3 rounded-lg border bg-card p-4"
            onSubmit={(e) => {
              e.preventDefault();
              createRoadmap.mutate();
            }}
          >
            <Input placeholder="Roadmap title" value={roadmapForm.title} onChange={(e) => setRoadmapForm({ ...roadmapForm, title: e.target.value })} required />
            <div className="grid gap-3 md:grid-cols-2">
              <SectionPicker sections={sections} value={roadmapForm.sectionId} onChange={(v) => setRoadmapForm({ ...roadmapForm, sectionId: v })} />
              <TypePicker types={types} value={roadmapForm.typeId} onChange={(v) => setRoadmapForm({ ...roadmapForm, typeId: v })} />
            </div>
            <Textarea placeholder="Description" value={roadmapForm.description} onChange={(e) => setRoadmapForm({ ...roadmapForm, description: e.target.value })} />
            <Textarea placeholder="Milestones (one per line)" value={roadmapForm.milestones} onChange={(e) => setRoadmapForm({ ...roadmapForm, milestones: e.target.value })} />
            <Button disabled={createRoadmap.isPending}>
              <Plus className="h-4 w-4" />
              Create roadmap
            </Button>
          </form>
          <div className="grid gap-4 lg:grid-cols-2">
            {(roadmapsQuery.data ?? []).map((roadmap) => (
              <div key={roadmap.id} className="rounded-lg border bg-card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold">{roadmap.title}</h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge>{roadmap.status}</Badge>
                      {roadmap.section ? <Badge variant="outline">{roadmap.section.name}</Badge> : null}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteRoadmap.mutate(roadmap.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {roadmap.description ? <p className="mt-3 text-sm text-muted-foreground">{roadmap.description}</p> : null}
                <ul className="mt-4 space-y-2">
                  {roadmap.milestones.map((m) => (
                    <li key={m.id} className="flex items-center gap-2 text-sm">
                      <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className={cn(m.status === "DONE" && "line-through text-muted-foreground")}>{m.title}</span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        {m.status.replaceAll("_", " ")}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {!roadmapsQuery.data?.length && roadmapsQuery.isSuccess ? <EmptyState icon={Map} title="No roadmaps" description="Plan milestones and track progress." /> : null}
        </div>
      )}

      {activeTab === "notes" && (
        <div className="space-y-4">
          <form
            className="grid gap-3 rounded-lg border bg-card p-4"
            onSubmit={(e) => {
              e.preventDefault();
              createNote.mutate();
            }}
          >
            <Input placeholder="Note title" value={noteForm.title} onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })} required />
            <div className="grid gap-3 md:grid-cols-2">
              <SectionPicker sections={sections} value={noteForm.sectionId} onChange={(v) => setNoteForm({ ...noteForm, sectionId: v })} />
              <TypePicker types={types} value={noteForm.typeId} onChange={(v) => setNoteForm({ ...noteForm, typeId: v })} />
            </div>
            <Textarea placeholder="Note content" value={noteForm.content} onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })} required />
            <Button disabled={createNote.isPending}>
              <Plus className="h-4 w-4" />
              Save note
            </Button>
          </form>
          <div className="grid gap-4 lg:grid-cols-2">
            {(notesQuery.data ?? []).map((note) => (
              <div key={note.id} className="rounded-lg border bg-card p-5">
                <div className="flex items-start justify-between">
                  <h2 className="font-semibold">{note.title}</h2>
                  <Button variant="ghost" size="icon" onClick={() => deleteNote.mutate(note.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{note.content}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {note.section ? <Badge variant="outline">{note.section.name}</Badge> : null}
                  {note.type ? <Badge variant="outline">{note.type.name}</Badge> : null}
                </div>
              </div>
            ))}
          </div>
          {!notesQuery.data?.length && notesQuery.isSuccess ? <EmptyState icon={BookOpen} title="No notes" description="Capture ideas and reference material." /> : null}
        </div>
      )}

      {activeTab === "photos" && (
        <div className="space-y-4">
          <form
            className="grid gap-3 rounded-lg border bg-card p-4"
            onSubmit={(e) => {
              e.preventDefault();
              createPhoto.mutate();
            }}
          >
            <Input placeholder="Title" value={photoForm.title} onChange={(e) => setPhotoForm({ ...photoForm, title: e.target.value })} required />
            <Input placeholder="Image URL" value={photoForm.url} onChange={(e) => setPhotoForm({ ...photoForm, url: e.target.value })} required />
            <div className="grid gap-3 md:grid-cols-2">
              <SectionPicker sections={sections} value={photoForm.sectionId} onChange={(v) => setPhotoForm({ ...photoForm, sectionId: v })} />
              <TypePicker types={types} value={photoForm.typeId} onChange={(v) => setPhotoForm({ ...photoForm, typeId: v })} />
            </div>
            <Input placeholder="Caption" value={photoForm.caption} onChange={(e) => setPhotoForm({ ...photoForm, caption: e.target.value })} />
            <Button disabled={createPhoto.isPending}>
              <Plus className="h-4 w-4" />
              Add photo
            </Button>
          </form>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {(photosQuery.data ?? []).map((photo) => (
              <div key={photo.id} className="overflow-hidden rounded-lg border bg-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt={photo.title} className="h-40 w-full object-cover" />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold">{photo.title}</h2>
                    <Button variant="ghost" size="icon" onClick={() => deletePhoto.mutate(photo.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {photo.caption ? <p className="mt-2 text-sm text-muted-foreground">{photo.caption}</p> : null}
                </div>
              </div>
            ))}
          </div>
          {!photosQuery.data?.length && photosQuery.isSuccess ? <EmptyState icon={ImageIcon} title="No photos" description="Add image URLs to build your gallery." /> : null}
        </div>
      )}

      {activeTab === "videos" && (
        <div className="space-y-4">
          <form
            className="grid gap-3 rounded-lg border bg-card p-4"
            onSubmit={(e) => {
              e.preventDefault();
              createVideo.mutate();
            }}
          >
            <Input placeholder="Title" value={videoForm.title} onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })} required />
            <Input placeholder="Video URL" value={videoForm.url} onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })} required />
            <div className="grid gap-3 md:grid-cols-2">
              <SectionPicker sections={sections} value={videoForm.sectionId} onChange={(v) => setVideoForm({ ...videoForm, sectionId: v })} />
              <TypePicker types={types} value={videoForm.typeId} onChange={(v) => setVideoForm({ ...videoForm, typeId: v })} />
            </div>
            <Input placeholder="Caption" value={videoForm.caption} onChange={(e) => setVideoForm({ ...videoForm, caption: e.target.value })} />
            <Button disabled={createVideo.isPending}>
              <Plus className="h-4 w-4" />
              Add video
            </Button>
          </form>
          <div className="grid gap-4 lg:grid-cols-2">
            {(videosQuery.data ?? []).map((video) => (
              <div key={video.id} className="rounded-lg border bg-card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold">{video.title}</h2>
                    <a href={video.url} target="_blank" rel="noreferrer" className="mt-1 block text-sm text-primary hover:underline">
                      {video.url}
                    </a>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteVideo.mutate(video.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {video.caption ? <p className="mt-3 text-sm text-muted-foreground">{video.caption}</p> : null}
              </div>
            ))}
          </div>
          {!videosQuery.data?.length && videosQuery.isSuccess ? <EmptyState icon={Video} title="No videos" description="Save links to reference videos." /> : null}
        </div>
      )}

      {activeTab === "graphics" && (
        <div className="space-y-4">
          <form
            className="grid gap-3 rounded-lg border bg-card p-4"
            onSubmit={(e) => {
              e.preventDefault();
              createGraphic.mutate();
            }}
          >
            <Input placeholder="Title" value={graphicForm.title} onChange={(e) => setGraphicForm({ ...graphicForm, title: e.target.value })} required />
            <Input placeholder="Graphic URL" value={graphicForm.url} onChange={(e) => setGraphicForm({ ...graphicForm, url: e.target.value })} required />
            <select className="h-10 rounded-md border bg-background px-3 text-sm" value={graphicForm.kind} onChange={(e) => setGraphicForm({ ...graphicForm, kind: e.target.value })}>
              {["DIAGRAM", "CHART", "MOCKUP", "ICON", "ILLUSTRATION", "OTHER"].map((kind) => (
                <option key={kind} value={kind}>
                  {kind}
                </option>
              ))}
            </select>
            <div className="grid gap-3 md:grid-cols-2">
              <SectionPicker sections={sections} value={graphicForm.sectionId} onChange={(v) => setGraphicForm({ ...graphicForm, sectionId: v })} />
              <TypePicker types={types} value={graphicForm.typeId} onChange={(v) => setGraphicForm({ ...graphicForm, typeId: v })} />
            </div>
            <Textarea placeholder="Description" value={graphicForm.description} onChange={(e) => setGraphicForm({ ...graphicForm, description: e.target.value })} />
            <Button disabled={createGraphic.isPending}>
              <Plus className="h-4 w-4" />
              Add graphic
            </Button>
          </form>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {(graphicsQuery.data ?? []).map((graphic) => (
              <div key={graphic.id} className="overflow-hidden rounded-lg border bg-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={graphic.url} alt={graphic.title} className="h-36 w-full object-cover" />
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <h2 className="font-semibold">{graphic.title}</h2>
                    <Button variant="ghost" size="icon" onClick={() => deleteGraphic.mutate(graphic.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Badge className="mt-2">{graphic.kind}</Badge>
                  {graphic.description ? <p className="mt-2 text-sm text-muted-foreground">{graphic.description}</p> : null}
                </div>
              </div>
            ))}
          </div>
          {!graphicsQuery.data?.length && graphicsQuery.isSuccess ? <EmptyState icon={Palette} title="No graphics" description="Store diagrams, charts, and design assets." /> : null}
        </div>
      )}
    </div>
  );
}
