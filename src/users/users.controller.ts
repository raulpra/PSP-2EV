import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  // Ruta para subir la foto: PATCH /users/1/avatar
  @Patch(':id/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      // Configuramos dónde y cómo se guarda el archivo físico
      storage: diskStorage({
        destination: './uploads', // Carpeta donde irán las fotos
        filename: (req, file, cb) => {
          // Le cambiamos el nombre para que sea único: idDelUsuario-numerosAleatorios.jpg
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const ext = extname(file.originalname);
          cb(null, `${req.params.id}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Ahora le pasamos la ruta (file.path) a nuestro servicio para que actualice la base de datos
    return this.usersService.updateAvatar(+id, file.path);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
