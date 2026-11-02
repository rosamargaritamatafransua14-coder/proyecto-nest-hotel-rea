/*
  Warnings:

  - You are about to drop the column `nombre_rol` on the `permiso` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nombre_permiso]` on the table `permiso` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nombre_rol]` on the table `rol` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nombre_permiso` to the `permiso` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "permiso_nombre_rol_key";

-- AlterTable
ALTER TABLE "permiso" DROP COLUMN "nombre_rol",
ADD COLUMN     "nombre_permiso" VARCHAR(100) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "permiso_nombre_permiso_key" ON "permiso"("nombre_permiso");

-- CreateIndex
CREATE UNIQUE INDEX "rol_nombre_rol_key" ON "rol"("nombre_rol");
