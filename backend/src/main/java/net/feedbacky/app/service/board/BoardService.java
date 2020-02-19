package net.feedbacky.app.service.board;

import java.util.List;

import org.springframework.http.ResponseEntity;

import net.feedbacky.app.rest.data.board.dto.FetchBoardDto;
import net.feedbacky.app.rest.data.board.dto.PatchBoardDto;
import net.feedbacky.app.rest.data.board.dto.PostBoardDto;
import net.feedbacky.app.rest.data.tag.dto.FetchTagDto;
import net.feedbacky.app.rest.data.tag.dto.PatchTagDto;
import net.feedbacky.app.rest.data.tag.dto.PostTagDto;
import net.feedbacky.app.service.FeedbackyService;
import net.feedbacky.app.utils.PaginableRequest;

/**
 * @author Plajer
 * <p>
 * Created at 11.10.2019
 */
public interface BoardService extends FeedbackyService {

  PaginableRequest<List<FetchBoardDto>> getAll(int page, int pageSize);

  FetchBoardDto getOne(String discriminator);

  ResponseEntity<FetchBoardDto> post(PostBoardDto dto);

  FetchBoardDto patch(String discriminator, PatchBoardDto dto);

  ResponseEntity delete(String discriminator);

  List<FetchTagDto> getAllTags(String discriminator);

  FetchTagDto getTagByName(String discriminator, String name);

  ResponseEntity<FetchTagDto> postTag(String discriminator, PostTagDto dto);

  FetchTagDto patchTag(String discriminator, String name, PatchTagDto dto);

  ResponseEntity deleteTag(String discriminator, String name);

}
