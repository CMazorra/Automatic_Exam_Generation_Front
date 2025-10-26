"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  MoreHorizontal,
  RefreshCw,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Plus,
  Trash2,
} from "lucide-react"

export interface Entity {
  id: number | string
  [key: string]: any
}

export interface SortFieldConfig {
  value: string
  label: string
}

export interface ListViewWithAddProps<T extends Entity> {
  title: string
  entities: T[]
  sortFields: SortFieldConfig[]
  filterFields: SortFieldConfig[]
  renderEntity: (entity: T) => React.ReactNode
  onAdd?: () => void
}

type SortOrder = "asc" | "desc"
type FilterType = {
  id: string
  field: string
  operation: string
  value: string
}

export function ListViewWithAdd<T extends Entity>({
  title,
  entities,
  sortFields,
  filterFields,
  renderEntity,
  onAdd,
}: ListViewWithAddProps<T>) {
  const [filters, setFilters] = useState<FilterType[]>([])
  const [currentFilter, setCurrentFilter] = useState({ field: "", operation: "", value: "" })
  const [sortField, setSortField] = useState<string>(sortFields[0]?.value || "")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set())
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [dragStartValue, setDragStartValue] = useState<boolean | null>(null)

  const addFilter = () => {
    if (currentFilter.field && currentFilter.operation && currentFilter.value) {
      setFilters([...filters, { ...currentFilter, id: Date.now().toString() }])
      setCurrentFilter({ field: "", operation: "", value: "" })
    }
  }

  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id))
  }

  const clearAllFilters = () => {
    setFilters([])
    setCurrentFilter({ field: "", operation: "", value: "" })
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  const toggleSelection = (id: string | number) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleMouseDown = (id: string | number, currentlySelected: boolean) => {
    setIsMouseDown(true)
    setDragStartValue(!currentlySelected)
    toggleSelection(id)
  }

  const handleMouseEnter = (id: string | number) => {
    if (isMouseDown && dragStartValue !== null) {
      const newSelected = new Set(selectedIds)
      if (dragStartValue) {
        newSelected.add(id)
      } else {
        newSelected.delete(id)
      }
      setSelectedIds(newSelected)
    }
  }

  const handleMouseUp = () => {
    setIsMouseDown(false)
    setDragStartValue(null)
  }

  const deleteSelected = () => {
    console.log("[v0] Eliminando entidades:", Array.from(selectedIds))
    setSelectedIds(new Set())
  }

  const handleAdd = () => {
    if (onAdd) {
      onAdd()
    } else {
      console.log("[v0] Añadiendo nueva entidad")
    }
  }

  const filteredAndSortedEntities = entities
    .filter((entity) => {

      for (const filter of filters) {
        const entityValue = entity[filter.field]

        let passes = false
        switch (filter.operation) {
          case "equals":
            passes = String(entityValue).toLowerCase() === filter.value.toLowerCase()
            break
          case "contains":
            passes = String(entityValue).toLowerCase().includes(filter.value.toLowerCase())
            break
          case "greater":
            passes = Number(entityValue) > Number(filter.value)
            break
          case "less":
            passes = Number(entityValue) < Number(filter.value)
            break
          default:
            passes = true
        }

        if (!passes) return false
      }

      return true
    })
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue
      }

      return sortOrder === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue))
    })

  return (
    <div className="min-h-screen bg-background" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <header className="border-b border-border bg-card mt-6 rounded-xl shadow-md">
        <div className="flex items-center justify-center px-6 py-4 gap-2">
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <ArrowUpDown className="h-4 w-4" />
                  <span className="hidden sm:inline">Ordenar</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Campo</label>
                    <Select value={sortField} onValueChange={(value) => setSortField(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sortFields.map((field) => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Orden</label>
                    <div className="flex gap-2">
                      <Button
                        variant={sortOrder === "asc" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSortOrder("asc")}
                        className="flex-1 gap-2"
                      >
                        <ArrowUp className="h-4 w-4" />
                        Ascendente
                      </Button>
                      <Button
                        variant={sortOrder === "desc" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSortOrder("desc")}
                        className="flex-1 gap-2"
                      >
                        <ArrowDown className="h-4 w-4" />
                        Descendente
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent relative">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filtrar</span>
                  {filters.length > 0 && (
                    <Badge
                      variant="default"
                      className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {filters.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[480px]" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground">Filtros</h4>
                    {filters.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-auto p-1 text-xs">
                        Limpiar todos
                      </Button>
                    )}
                  </div>

                  {filters.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Filtros activos</label>
                      <div className="space-y-2">
                        {filters.map((filter) => (
                          <div
                            key={filter.id}
                            className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2"
                          >
                            <span className="flex-1 text-sm">
                              <span className="font-medium">{filter.field}</span>{" "}
                              <span className="text-muted-foreground">{filter.operation}</span>{" "}
                              <span className="font-medium">{filter.value}</span>
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFilter(filter.id)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="text-xs font-medium text-muted-foreground">Agregar nuevo filtro</label>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Campo</label>
                        <Select
                          value={currentFilter.field}
                          onValueChange={(value) => setCurrentFilter({ ...currentFilter, field: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Campo" />
                          </SelectTrigger>
                          <SelectContent>
                            {filterFields.map((field) => (
                              <SelectItem key={field.value} value={field.value}>
                                {field.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Operación</label>
                        <Select
                          value={currentFilter.operation}
                          onValueChange={(value) => setCurrentFilter({ ...currentFilter, operation: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Op" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">Igual</SelectItem>
                            <SelectItem value="contains">Contiene</SelectItem>
                            <SelectItem value="greater">Mayor</SelectItem>
                            <SelectItem value="less">Menor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Valor</label>
                        <Input
                          placeholder="Valor"
                          value={currentFilter.value}
                          onChange={(e) => setCurrentFilter({ ...currentFilter, value: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addFilter}
                      disabled={!currentFilter.field || !currentFilter.operation || !currentFilter.value}
                      className="w-full gap-2 bg-transparent"
                    >
                      <Plus className="h-4 w-4" />
                      Agregar filtro
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2 bg-transparent">
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Recargar</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Exportar datos</DropdownMenuItem>
                <DropdownMenuItem>Importar datos</DropdownMenuItem>
                <DropdownMenuItem>Configuración</DropdownMenuItem>
                <DropdownMenuItem>Ayuda</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground text-balance">{title}</h1>
          <p className="mt-2 text-muted-foreground">
            Mostrando {filteredAndSortedEntities.length} de {entities.length} entidades
          </p>
        </div>

        <div className="space-y-3">
          {filteredAndSortedEntities.map((entity) => (
            <div key={entity.id} className="flex items-start gap-3" onMouseEnter={() => handleMouseEnter(entity.id)}>
              <div
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleMouseDown(entity.id, selectedIds.has(entity.id))
                }}
                className="cursor-pointer select-none"
              >
                <Checkbox checked={selectedIds.has(entity.id)} className="mt-4 pointer-events-none" />
              </div>
              <div className="flex-1">{renderEntity(entity)}</div>
            </div>
          ))}

          {filteredAndSortedEntities.length === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-muted/20 p-12 text-center">
              <p className="text-muted-foreground">No se encontraron entidades con los filtros aplicados</p>
            </div>
          )}
        </div>
      </main>

      {selectedIds.size === 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            size="lg"
            onClick={handleAdd}
            className="gap-2 shadow-lg hover:shadow-xl transition-shadow bg-primary text-primary-foreground"
          >
            <Plus className="h-5 w-5" />
            Añadir
          </Button>
        </div>
      )}

      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            size="lg"
            variant="destructive"
            onClick={deleteSelected}
            className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Trash2 className="h-5 w-5" />
            Eliminar ({selectedIds.size})
          </Button>
        </div>
      )}
    </div>
  )
}
