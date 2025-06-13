import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { CreateRsvpBodyDto, GetMyRsvpBodyDto, RsvpResponseDto, UpdateRsvpBodyDto } from "src/dto/rsvp.dto";
import { DatabaseService } from "src/services/database.service";

@Controller("rsvp")
@ApiTags("RSVP")
export class RsvpController {
	constructor(private database: DatabaseService) {}

	@Post("search")
	searchRsvp(@Query() query: GetMyRsvpBodyDto): RsvpResponseDto {
		const rsvp = this.database.searchRsvp(query);
		if (!rsvp) throw new NotFoundException("RSVP not found");

		return rsvp as RsvpResponseDto;
	}

	@Post()
	async createRsvp(@Body() body: CreateRsvpBodyDto, @Req() req: Request): Promise<RsvpResponseDto> {
		const rsvp = await this.database.createRsvp({
			...body,
			domain: req.headers.host,
			userAgent: req.headers["user-agent"],
		});

		return rsvp as RsvpResponseDto;
	}

	@Get(":rsvpId")
	getRsvp(@Param("rsvpId") rsvpId: string): RsvpResponseDto {
		const rsvp = this.database.getRsvp(rsvpId);
		if (!rsvp) throw new NotFoundException("RSVP not found");

		return rsvp as RsvpResponseDto;
	}

	@Patch(":rsvpId")
	async updateRsvp(@Param("rsvpId") rsvpId: string, @Body() body: UpdateRsvpBodyDto) {
		let rsvp = this.database.getRsvp(rsvpId);
		if (!rsvp) throw new NotFoundException("RSVP not found");

		rsvp = await this.database.updateRsvp(rsvpId, body);

		return rsvp as RsvpResponseDto;
	}
}
